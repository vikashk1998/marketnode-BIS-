# GitHub Actions — Secrets

Configure these repository secrets before the CI workflow can pull app images and run tests:

| Secret | Example / notes |
|--------|-----------------|
| `ACR_USERNAME` | `candidate` (Azure Container Registry username from TASKS.md) |
| `ACR_PASSWORD` | ACR password / token from TASKS.md |

## How to add secrets

1. Open the GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add `ACR_USERNAME` and `ACR_PASSWORD`

Without these secrets, `docker compose up` cannot pull:

- `interviewmarketnode.azurecr.io/qa-bond-issuance-backend:0.0.1`
- `interviewmarketnode.azurecr.io/qa-bond-issuance-frontend:0.0.1`

## What CI does

On every push/PR to `main`/`master` (and on **Run workflow**):

1. Install Node + Playwright Chromium
2. Login to ACR
3. `docker compose up -d`
4. Wait for `:8080` and `:5173`
5. Run `./run-tests.sh` (or optional grep filter via workflow_dispatch)
6. Upload HTML report + JUnit/JSON artifacts
7. Tear down compose

## Local parity

```bash
docker login -u "$ACR_USERNAME" -p "$ACR_PASSWORD" interviewmarketnode.azurecr.io
docker compose up -d
./run-tests.sh
```
