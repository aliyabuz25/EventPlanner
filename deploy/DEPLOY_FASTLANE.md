# Fastlane Deploy

## Preflight

- Current repo path: project root
- OS check, cwd check and Docker network check were done locally
- `edge` Docker network exists
- `/datastore` does not exist on this workstation, so the final copy/deploy step must be run on the target server

## Target layout

```text
/datastore/fastlane/
  fastlane.zip
  app/
  uploads/
  nginx-logs/
  data/
```

`nginx-logs` is included only to match your standard layout. This app does not need nginx because the Node server already serves frontend, API and uploads.

## Why one container

This project already serves:

- frontend build from `dist/`
- API routes from `server.mjs`
- uploaded files from `/uploads/...`

So splitting frontend/backend would add complexity without benefit.

## Build on host

```bash
docker compose -f /datastore/fastlane/app/docker-compose.yml build fastlane
```

## Portainer stack

Use:

- `/datastore/fastlane/app/docker-compose.yml`

If Portainer is using the repository/stack file mode, point it to:

- `docker-compose.yml`

Important:

- Do not enable a "pull latest image" style deploy flow for this stack
- This stack is intended to build from the repository, not pull `fastlane-octotech` from a registry

If Portainer is using the web editor, paste the contents of:

- `docker-compose.yml`

## Cloudflared / Zero Trust

Public hostname target:

```text
http://traefik:80
```

Hostname:

```text
fastlane.octotech.az
```

## Curl test

```bash
curl -H "Host: fastlane.octotech.az" http://traefik:80/
curl -H "Host: fastlane.octotech.az" http://traefik:80/api/site-content
```

## Important notes

- No host port mapping is needed
- Upload URLs are already relative: `/uploads/<file>`
- API calls are already relative: `/api/...`
- Ollama inside the container is configured to hit the host via `host.docker.internal:11434`
- If the Linux host does not support `host-gateway`, replace `OLLAMA_CHAT_URL` with the real host IP
- Traefik routers are configured for both `web` and `websecure` entrypoints so the host can match behind either HTTP or HTTPS tunnel routing
- Use the Traefik container/service name on the shared Docker network for Cloudflare or cloudflared upstreams, not `localhost`
- `127.0.0.1:8080` is commonly the Traefik dashboard/API port, not the public router entrypoint; if Cloudflare points there, you will typically get `404 page not found`
