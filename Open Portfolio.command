#!/bin/zsh
cd "$(dirname "$0")"

port=4173
url="http://localhost:${port}/index.html"

if ! lsof -ti tcp:${port} >/dev/null 2>&1; then
  python3 -m http.server "${port}" >/tmp/ryan-portfolio-preview.log 2>&1 &
  sleep 1
fi

open -a "Google Chrome" "${url}"
