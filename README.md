# Tic Tac Toe Fullstack (Nakama + React)

Realtime multiplayer Tic Tac Toe built with:

- **Backend:** [Nakama](https://heroiclabs.com/docs/nakama/) + PostgreSQL + JavaScript runtime module
- **Frontend:** React + `@heroiclabs/nakama-js`

---

## Quick Start
### Backend
```bash
docker compose up -d
docker compose logs -f nakama

### Frontend
```bash
cd tic-tac-toe-client
npm install
npm start

## Project Structure

```text
.
├── docker-compose.yaml
├── modules/
│   └── tictactoe.js
└── tic-tac-toe-client/
    ├── package.json
    └── src/

