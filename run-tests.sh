#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "=============================================="
echo " Bond Issuance System — Automation Suite"
echo "=============================================="
echo "Assuming docker compose stack is already running."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8080"
echo

if ! curl -sf "http://localhost:8080/api/system/date" >/dev/null; then
  echo "ERROR: Backend is not reachable at http://localhost:8080"
  echo "Start the stack with: docker compose up -d"
  exit 1
fi

if ! curl -sf "http://localhost:5173" >/dev/null; then
  echo "ERROR: Frontend is not reachable at http://localhost:5173"
  exit 1
fi

echo "✓ Application stack is reachable"
echo

if [[ ! -d node_modules ]]; then
  echo "Installing npm dependencies..."
  npm install
fi

if ! npx playwright --version >/dev/null 2>&1; then
  echo "Playwright not found after install"
  exit 1
fi

# Ensure Chromium browser is available
npx playwright install chromium

mkdir -p reports/html reports/logs test-data/generated

echo
echo "Resetting business date to today for a clean baseline..."
curl -sf -X POST "http://localhost:8080/api/system/reset" >/dev/null || true
echo "Business date: $(curl -sf http://localhost:8080/api/system/date)"
echo

echo "Running full Playwright suite..."
# Prefer CI=true when present so retries/workers match playwright.config.ts
export CI="${CI:-}"
# Use config reporters (html/json/junit → reports/); list for console
npx playwright test

EXIT_CODE=$?

echo
echo "=============================================="
echo " Reports"
echo "=============================================="
echo "HTML:  $ROOT_DIR/reports/html/index.html"
echo "JSON:  $ROOT_DIR/reports/results.json"
echo "JUnit: $ROOT_DIR/reports/junit.xml"
echo "Logs:  $ROOT_DIR/reports/logs/"
echo

if [[ $EXIT_CODE -eq 0 ]]; then
  echo "✓ All tests completed successfully"
else
  echo "✗ Suite finished with failures (exit $EXIT_CODE)"
  echo "Open the HTML report for details."
fi

exit $EXIT_CODE
