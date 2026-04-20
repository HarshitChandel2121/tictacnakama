# Multiplayer Tic Tac Toe (Fullstack)

# 🌐 Live Demo

- **Frontend:** https://tictacnakama.vercel.app/  
- **Backend (Nakama Server):** https://tictacnakama.duckdns.org/

---

A realtime multiplayer Tic Tac Toe game built with:

- **Backend:** Nakama + PostgreSQL + custom JavaScript match logic
- **Frontend:** React + Nakama JavaScript client SDK

---

# 🧱 Tech Stack

## Backend
- Nakama (Server + Runtime Modules)
- PostgreSQL
- Docker

## Frontend
- React (Create React App)
- @heroiclabs/nakama-js SDK

## Deployment
- AWS EC2 / VPS (Backend)
- Vercel (Frontend)

---

## Project Structure

```text
.
├── docker-compose.yaml
├── modules/
│   └── tictactoe.js
└── tic-tac-toe-client/
    ├── package.json
    └── src/
```

- `docker-compose.yaml` starts backend services (`nakama`, `postgres`)
- `modules/tictactoe.js` contains authoritative multiplayer game logic and RPC registration
- `tic-tac-toe-client` contains the React frontend

---

## Prerequisites

Install before running:

- Docker
- Docker Compose
- Node.js (LTS recommended)
- npm

---

## Quick Start (Local)

### 1) Start Backend

From the project root:

```bash
docker compose up -d
```

Check backend logs:

```bash
docker compose logs -f nakama
```

Stop backend:

```bash
docker compose down
```

---

### 2) Start Frontend

In a new terminal:

```bash
cd tic-tac-toe-client
npm install
npm start
```

Frontend runs at:

- `http://localhost:3000`

---

## Service Ports

Current `docker-compose.yaml` exposes:

- `7350` (Nakama API; used by frontend client)
- `7349`
- `7351`
- `5432` (PostgreSQL)

---

## Frontend <-> Backend Connection

Frontend client configuration is in `tic-tac-toe-client/src/App.js`:

```js
const client = new Client("defaultkey", "localhost", "7350", false);
```

For deployment, replace `"localhost"` with your server/domain.

---

## Gameplay/Backend Features

- Device-based authentication
- Room-based multiplayer matches
- Matchmaker integration
- Reconnect/disconnect handling
- Timed and relaxed game modes
- Global leaderboard updates

---

## Useful Commands

### Docker / Backend

```bash
docker compose up -d
docker compose down
docker compose ps
docker compose logs -f nakama
docker compose logs -f postgres
```

### Frontend

```bash
cd tic-tac-toe-client
npm install
npm start
npm run build
npm test
```

---

## Deployment Notes (EC2)

1. Deploy backend files (`docker-compose.yaml`, `modules/`) to EC2
2. Run `docker compose up -d`
3. Open required Security Group ports (at least `7350`)
4. Keep `5432` private (recommended)
5. Update frontend backend host from `localhost` to EC2 public DNS/IP (or domain)

---

## Troubleshooting

### Frontend cannot connect to backend

- Confirm containers are running: `docker compose ps`
- Check Nakama logs: `docker compose logs -f nakama`
- Verify frontend points to correct backend host/port
- Ensure firewall/security group allows `7350`

### Runtime module issues

- Confirm file exists: `modules/tictactoe.js`
- Verify compose entrypoint includes `--runtime.js_entrypoint tictactoe.js`
- Restart backend after module changes:
  - `docker compose down`
  - `docker compose up -d`

### Port already in use

- Stop conflicting process/service
- Or change port mapping in `docker-compose.yaml`

---
