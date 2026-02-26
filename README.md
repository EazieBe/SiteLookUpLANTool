# Site Lookup LAN Tool

A lightweight web app for looking up site numbers, IP addresses, and port matrices on your local network. Paste spreadsheet data (sites and/or port matrices), then search by site number and copy IPs or open FortiVoice-style URLs.

## Features

- **Site# lookup** — Enter a site number to get address, IP, and related info
- **Port matrices** — View and manage port matrices by brand (paste from Excel/Sheets)
- **One-click copy** — Copy IP address or open `https://IP/admin` (FortiVoice format)
- **Sites & matrix upload** — Update `data.json` and port matrices via the UI (paste tab- or comma-separated data)
- **LAN-first** — Runs on your machine; data stays local

## Requirements

- **Node.js** 18+ (for ES modules)

## Quick Start

```bash
# Install dependencies
npm install

# Run the server (default: http://localhost:3005)
npm start
```

Then open **http://localhost:3005** in your browser.

## Project Structure

| Path | Purpose |
|------|--------|
| `server.js` | Express server, API routes, spreadsheet parsing |
| `public/` | Static frontend (`index.html`, assets) |
| `data.json` | Site list (updated via UI or replace file) |
| `port-matrices.json` | Port matrices by brand (updated via UI) |

## API

- `GET /api/data` — Returns `{ sites, matrices }`
- `POST /api/data` — Replace sites (body: `{ rawText }` — pasted spreadsheet)
- `POST /api/matrix` — Add/update port matrix (body: `{ brand, rawText }`)

## License

MIT — see [LICENSE](LICENSE).
