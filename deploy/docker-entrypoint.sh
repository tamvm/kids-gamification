#!/bin/sh
set -eu
mkdir -p "$(dirname "${DATABASE_PATH:-/data/app.db}")"
npx tsx src/db/migrate.ts
exec npx next start -H 0.0.0.0 -p "${PORT:-3000}"
