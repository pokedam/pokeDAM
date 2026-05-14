# PokeDAM Deployment Plan

Date: 2026-05-14
Server IP: 51.103.210.63

## Status

- [x] Access to VM via SSH confirmed
- [x] System packages updated (apt update)
- [x] Base packages installed: nginx, openjdk-21-jdk, git, curl, unzip, build-essential, python3
- [x] NodeSource repo configured for Node 22
- [x] Client adjusted to use same-origin API and sockets
- [x] Rest-server auth key read from config/env

## Remaining steps
- [ ] Install Node.js 22 (`apt install -y nodejs`)
- [ ] Decide code transfer method (git clone vs rsync/scp)
- [ ] Resolve backend dependency on local package `sim`
- [ ] Configure PostgreSQL (database, user, permissions)
- [ ] Define environment variables files
  - Backend: `PORT`, `JWT_SECRET`, `MAIN_SERVER_URL`, `MAIN_SERVER_KEY`
  - Rest-server: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `MAIN_SERVER_KEY`
- [ ] Build artifacts
  - shared_types
  - backend (tsc)
  - client (Angular production build)
  - rest-server (Spring Boot jar)
- [ ] Create systemd services for backend and rest-server
- [ ] Configure nginx
  - Serve Angular build
  - Reverse proxy /api -> backend
  - Reverse proxy /rest -> rest-server
  - Enable WebSocket proxying
- [ ] Add TLS (Lets Encrypt) and HTTP -> HTTPS redirect
- [ ] Validate deployment (health checks, logs, restart policy)
