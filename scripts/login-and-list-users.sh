#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/login-and-list-users.sh [email] [password]
#
# Optional env vars:
#   API_URL=http://localhost:3000
#   PAGE=1
#   LIMIT=10

API_URL="${API_URL:-http://localhost:3000}"
EMAIL="${1:-testuser2@example.com}"
PASSWORD="${2:-Testpass01!}"
PAGE="${PAGE:-1}"
LIMIT="${LIMIT:-10}"

echo "[1/2] Login: ${EMAIL}"
LOGIN_JSON=$(curl -sS -X POST "${API_URL}/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(node -e "const data = JSON.parse(process.argv[1] || '{}'); process.stdout.write(data.token || '');" "$LOGIN_JSON")

if [[ -z "$TOKEN" ]]; then
  echo "No se pudo obtener token. Respuesta:"
  echo "$LOGIN_JSON"
  exit 1
fi

echo "[2/2] List users: page=${PAGE}, limit=${LIMIT}"
curl -sS -X GET "${API_URL}/users?page=${PAGE}&limit=${LIMIT}" \
  -H "Authorization: Bearer ${TOKEN}" | node -e "const fs=require('fs');const s=fs.readFileSync(0,'utf8');try{console.log(JSON.stringify(JSON.parse(s),null,2));}catch{console.log(s);}"
