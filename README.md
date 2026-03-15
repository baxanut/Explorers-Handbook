# The Explorers Handbook
**Presint 14, Putrajaya** — A shared field handbook for The Explorers crew.

## Features
- 🗺 Fantasy map with pin drops and free-draw paths (shared across all devices)
- 📖 Expedition log
- 🏅 Explorer ranks & leaderboard
- 🧭 Mission planner
- 🌦 Weather intel
- 🔒 Crew login + admin panel

## Deploy to Render

1. Push this folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml` and configure everything
5. Hit Deploy!

## Environment Variables (set in Render dashboard)
| Variable | Default | Description |
|---|---|---|
| `CREW_PASSPHRASE` | `explorers14` | Passphrase for all crew members |
| `ADMIN_PASSWORD` | `abhinav123` | Abhinav's admin password — **change this!** |
| `PORT` | `3000` | Auto-set by Render |

## Local Development
```bash
npm install
npm start
# Open http://localhost:3000
```

## Important Notes
- Data is stored in `data.json` on the server. On Render's free tier, the disk resets on redeploy. To persist data permanently, upgrade to a paid plan or swap the JSON storage for a free database like [Supabase](https://supabase.com) or [MongoDB Atlas](https://www.mongodb.com/atlas).
- Change `ADMIN_PASSWORD` before going live!
