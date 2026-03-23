# Fastlane Deploy

## Preflight

- Do not start before validating OS, shell, uid, cwd, git state and `/datastore` access
- Confirm this is the server environment and that Docker, Traefik and Portainer are present
- Fixed assumptions for this app:
  - Traefik entrypoint: `web`
  - Cloudflared upstream to Traefik: `http://127.0.0.1:8080`
  - Traefik docker network: `edge` (external)
  - No host port publishing; routing is done only by Traefik labels

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
http://127.0.0.1:8080
```

Hostname:

```text
fastlane.octotech.az
```

## Curl test

```bash
curl -H "Host: fastlane.octotech.az" http://127.0.0.1:8080/
curl -H "Host: fastlane.octotech.az" http://127.0.0.1:8080/api/site-content
docker ps | grep fastlane
```

## Important notes

- No host port mapping is needed
- Upload URLs are already relative: `/uploads/<file>`
- API calls are already relative: `/api/...`
- Ollama inside the container is configured to hit the host via `host.docker.internal:11434`
- If the Linux host does not support `host-gateway`, replace `OLLAMA_CHAT_URL` with the real host IP
- Traefik labels already keep the API rule wrapped in parentheses
- Long labels must stay in single quotes
- If new static paths are added later, extend the API router rule, for example with `PathPrefix(`/cdn`)`
