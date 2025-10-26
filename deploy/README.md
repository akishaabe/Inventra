Inventra deployment (Hostinger VPS + Nginx + Docker Compose)

This folder contains a production-ready setup to deploy the full stack: MySQL, backend (Node/Express), ml_service (FastAPI/Prophet), and Nginx serving the Angular apps and proxying /api and /ml.

Prereqs
- Hostinger VPS with Docker and Docker Compose installed
- Domain DNS A records pointing to the VPS for:
  - api.cafe-inventra.com
  - ml.cafe-inventra.com (optional to expose)
  - admin.cafe-inventra.com
  - supad.cafe-inventra.com
  - staff.cafe-inventra.com
  - shared.cafe-inventra.com

1) Create your .env
- Copy .env.example to .env at repo root and fill required values.

2) Build Angular apps locally
- In each app folder under frontend-app (admin, supad, staff, shared), run production builds to create dist outputs.
- Copy the dist outputs to the server or place them under deploy/static like this:
  - deploy/static/admin -> contains index.html and assets for Admin
  - deploy/static/supad -> Supad
  - deploy/static/staff -> Staff
  - deploy/static/shared -> Shared

3) Start the stack
- From deploy/compose, run Docker Compose to start mysql, backend, ml_service, and nginx.

4) Verify
- Visit https://admin.cafe-inventra.com (replace with your domain) and log in.
- API health: https://api.cafe-inventra.com/health
- Backend root: https://api.cafe-inventra.com/
- ML root (optional): https://ml.cafe-inventra.com/

Notes
- If you do not want to expose the ML publicly, omit the DNS record for ml.* and remove ml.conf or firewall it.
- Ensure ALLOWED_ORIGINS in .env includes the exact frontend origins (https URLs).
- Add TLS using a reverse proxy companion or install certbot on the VPS and convert these server blocks to listen 443 ssl;.

Database: how to import your data

Option A — Auto-initialize on first run (easiest for fresh installs)
- Put your .sql files into deploy/db-init (e.g., 01_schema.sql, 02_seed.sql, 03_dump.sql).
- On FIRST startup of MySQL (empty data volume), these run automatically.
- If the DB already has data, these files are skipped (by design).

Option B — Manual import into a running MySQL container
- Copy your .sql file to the server and run:
  docker exec -i inventra-mysql mysql -u root -p$MYSQL_ROOT_PASSWORD ${MYSQL_DATABASE} < /path/on/server/your.sql

Option C — Temporary phpMyAdmin
- Start a helper container (only when needed):
  docker compose -f deploy/compose/docker-compose.tools.yml up -d
- Open http://SERVER_IP:8080, login with MYSQL_USER / MYSQL_PASSWORD, and import the SQL dump.
- Stop/remove phpMyAdmin after use for security.

Backups
- Create dump: docker exec inventra-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD ${MYSQL_DATABASE} > backup.sql
- Restore: docker exec -i inventra-mysql mysql -u root -p$MYSQL_ROOT_PASSWORD ${MYSQL_DATABASE} < backup.sql
