import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3005;
const DATA_FILE = path.join(__dirname, 'data.json');
const MATRIX_FILE = path.join(__dirname, 'port-matrices.json');

// High limit for large pastes
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

let currentData = [];
let portMatrices = {};

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log(`✅ Loaded ${currentData.length} sites`);
  }
  if (fs.existsSync(MATRIX_FILE)) {
    portMatrices = JSON.parse(fs.readFileSync(MATRIX_FILE, 'utf8'));
    console.log(`✅ Loaded port matrices for ${Object.keys(portMatrices).length} brands`);
  }
}
loadData();

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/api/data', (req, res) => res.json({ sites: currentData, matrices: portMatrices }));

// Main sites upload
app.post('/api/data', (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: 'No data received' });
    console.log(`📥 Sites upload: ${rawText.length} characters`);
    const parsed = parseSpreadsheet(rawText);
    currentData = parsed;
    fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2));
    console.log(`✅ Saved ${parsed.length} sites`);
    res.json({ success: true, count: parsed.length });
  } catch (err) {
    console.error('Sites upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// NEW - Port Matrix upload (this was missing before)
app.post('/api/matrix', (req, res) => {
  try {
    const { brand, rawText } = req.body;
    if (!brand || !rawText) return res.status(400).json({ error: 'Brand name and matrix data required' });
    console.log(`📥 Matrix upload for brand: ${brand} (${rawText.length} chars)`);
    const parsed = parseSpreadsheet(rawText);
    portMatrices[brand.trim()] = parsed;
    fs.writeFileSync(MATRIX_FILE, JSON.stringify(portMatrices, null, 2));
    console.log(`✅ Saved matrix for ${brand} (${parsed.length} rows)`);
    res.json({ success: true, brand, rows: parsed.length });
  } catch (err) {
    console.error('Matrix upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

function parseSpreadsheet(text) {
  if (!text.trim()) return [];
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  let delimiter = '\t';
  let headers = lines[0].split(delimiter).map(h => h.trim());
  if (headers.length < 3) {
    delimiter = ',';
    headers = lines[0].split(delimiter).map(h => h.trim());
  }
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(delimiter).map(v => v.trim());
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    if (Object.values(row).some(v => v)) data.push(row);
  }
  return data;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ICS Site# Lookup + Port Matrices running on http://0.0.0.0:${PORT}`);
});
