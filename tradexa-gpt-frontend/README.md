# Tradexa GPT Frontend

React dashboard for the Tradexa GPT Spring Boot API.

## Run

```bash
cd tradexa-gpt-frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Keep the backend on `http://localhost:8080`.

Vite proxies `/api` to the backend, so the browser stays same-origin in development.

## Pages

- `/login` `/register` — JWT auth
- `/` — dashboard (P&L, win rate, charts)
- `/trades` — create / edit / delete
- `/analytics` — mean, median, variance, skewness, market hours
- `/upload` — CSV import
