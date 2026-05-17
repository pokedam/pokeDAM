# PokeDAM Deployment Plan

Date: 2026-05-14
Server IP: 51.103.210.63
**Automatic connection using 51.103.210.63**

## Status

- [x] Access to VM via SSH confirmed
- [x] System packages updated (apt update)
- [x] Base packages installed: nginx, openjdk-21-jdk, git, curl, unzip, build-essential, python3
- [x] NodeSource repo configured for Node 22
- [x] Client adjusted to use same-origin API and sockets
- [x] Universal dynamic routing enabled for Tauri desktop apps and public IPs
- [x] Rest-server auth key read from config/env

## Remaining steps
- [x] Install Node.js 22 (`apt install -y nodejs`) - *Installed v22.22.2*
- [x] Decide code transfer method (git clone vs rsync/scp) - *Using Git clone in `/opt/pokedam/app`*
- [x] Resolve backend dependency on local package `sim` - *Resolved in Git repo*
- [x] Configure PostgreSQL (database, user, permissions) - *Database `pokedam` with user `pokedam` active*
- [x] Install and configure MongoDB for GameRepository storage - *Installed MongoDB 8.0 and enabled `mongod.service`*
- [x] Define environment variables files
  - Backend: `PORT`, `JWT_SECRET`, `MAIN_SERVER_URL`, `MAIN_SERVER_KEY` (configured in systemd unit)
  - Rest-server: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_DRIVER_CLASS_NAME`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `MAIN_SERVER_KEY` (configured in systemd unit)
- [x] Build artifacts
  - shared_types (built successfully)
  - backend (compiled with tsc)
  - client (Angular production build in `dist/client/browser/`)
  - rest-server (Spring Boot jar packaged)
- [x] Create systemd services for backend and rest-server (`pokedam-backend.service` and `pokedam-rest.service` active and enabled)
- [x] Configure nginx
  - Serve Angular build from `/opt/pokedam/app/client/dist/client/browser`
  - Reverse proxy `/api` -> backend (8080)
  - Reverse proxy `/rest` -> rest-server (8081)
  - Enable WebSocket proxying
- [ ] Add TLS (Lets Encrypt) and HTTP -> HTTPS redirect *(Requires public domain name pointing to 51.103.210.63)*
- [x] Validate deployment (health checks, logs, restart policy) - *All services active and verified with HTTP 200/403 responses*
