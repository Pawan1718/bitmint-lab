#!/usr/bin/env bash
# Read-only checks for production asset caching and first-paint delivery.
set -euo pipefail
base="https://bitmintlab.in"
for resource in / /assets/css/webmint.optimized.css /assets/css/webmint-motion.optimized.css /assets/img/bitmint-lab-full-540.webp /assets/img/notiq-icon-64.webp /assets/js/webmint-motion.js; do
  echo "=== $resource ==="
  curl -sSLI --max-time 15 "$base$resource" | grep -Ei '^(HTTP/|cache-control:|expires:|content-type:|content-length:|etag:|last-modified:)'
done
echo
echo "External NOTIQ/K-RAG resources need their own cache headers; this Nginx server cannot control them."
