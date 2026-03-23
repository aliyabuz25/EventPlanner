# Fastlane Deploy

## Preflight

- Do not start before validating OS, shell, uid, cwd, git state and `/datastore` access
- Confirm this is the server environment and that Docker, Traefik and Portainer are present
- Fixed assumptions for this app:
  - App listens on `3000`
  - Cloudflared/Cloudflare origin target: `http://localhost:3000`
  - Traefik docker network: `edge` (external)
  - Host port `3000` is published for direct tunnel targeting

## Target layout

```text
/datastore/fastlane/
  fastlane.zip
  app/
  uploads/
  nginx-logs/
  data/
```

`nginx-logs` is kept only to match the standard datastore layout. This app serves frontend, API and uploads from one Node container.

## ZIP / Extract

- ZIP location:

```text
/datastore/fastlane/fastlane.zip
```

- Extract to:

```text
/datastore/fastlane/app
```

## Mandatory code checks

- Frontend must not use hardcoded `http://localhost` API calls
- API calls must stay relative
- Upload responses must return relative paths like `/uploads/<file>`
- This app already satisfies the relative upload/API requirement

## Build on host

```bash
docker build -t fastlane-octotech:latest -f /datastore/fastlane/app/Dockerfile /datastore/fastlane/app
```

## Portainer stack

Use:

- `/datastore/fastlane/app/docker-compose.yml`

- Preferred: let the stack build from the repository/app path
- If Portainer is using repository stack mode, use `docker-compose.yml`
- If Portainer is using the web editor on the server, use `deploy/fastlane.portainer.yml`
- Do not use a deploy flow that starts with `compose pull` for this stack
- The `fastlane-octotech` tag is a local build artifact, not a registry image

## Cloudflared / Zero Trust

Public hostname target:

```text
http://localhost:3000
```

Hostname:

```text
fastlane.octotech.az
```

## Curl test

```bash
curl http://localhost:3000/
curl http://localhost:3000/api/site-content
docker ps | grep fastlane
```

## Important notes

- Port `3000` is published intentionally so the tunnel can target the app directly
- Upload URLs are already relative: `/uploads/<file>`
- API calls are already relative: `/api/...`
- Ollama inside the container is configured to hit the host via `host.docker.internal:11434`
- If the Linux host does not support `host-gateway`, replace `OLLAMA_CHAT_URL` with the real host IP
- Traefik labels may remain, but Cloudflare can point directly to `localhost:3000` for this app
- If new static paths are added later, extend the API router rule, for example with `PathPrefix(`/cdn`)`
