#!/bin/sh
set -eu

cd /app/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
uvicorn_pid=$!

cd /app/web
node server.js &
web_pid=$!

nginx -g 'daemon off;' &
nginx_pid=$!

cleanup() {
    kill -TERM "$nginx_pid" "$web_pid" "$uvicorn_pid" 2>/dev/null || true
    wait "$nginx_pid" 2>/dev/null || true
    wait "$web_pid" 2>/dev/null || true
    wait "$uvicorn_pid" 2>/dev/null || true
}

trap cleanup INT TERM

while kill -0 "$nginx_pid" "$web_pid" "$uvicorn_pid" 2>/dev/null; do
    sleep 2
done

cleanup
