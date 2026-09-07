# Rahim Fabrics

Custom wholesale fabric catalogue and inquiry platform built with React, TypeScript, Tailwind CSS, Express, MongoDB and Cloudinary.

## Local setup

1. Copy `server/.env.example` to `server/.env` and fill in MongoDB, JWT and Cloudinary values.
2. Run `npm run install:all`.
3. Seed the first admin and catalogue with `npm --prefix server run seed`.
4. Start both apps with `npm run dev`.

The client runs at `http://localhost:5173` and the API at `http://localhost:5000`. The catalogue uses polished local demo data if the API is unavailable.

## VPS deployment

Build with `npm run build`, set `NODE_ENV=production`, then run `npm start` behind Nginx/Apache. Express serves `client/dist` in production. Set all values from `server/.env.example`; use a process manager such as PM2 and terminate TLS at the reverse proxy.
