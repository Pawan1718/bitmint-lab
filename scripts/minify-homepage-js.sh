#!/usr/bin/env bash
# Reproducible first-party JS optimization; generates files for review, not deployment.
# Do not change HTML or deploy until browser tests are completed.
set -euo pipefail
cd "$(dirname "$0")/.."

command -v node >/dev/null || { echo "Node.js required" >&2; exit 1; }
command -v npm >/dev/null || { echo "npm required" >&2; exit 1; }

printf '%-35s %12s %12s\n' "Source" "Original" "Minified"
for filename in webmint.js webmint-motion.js site-navigation.js contact-enquiry.js; do
  src="assets/js/$filename"
  dest="assets/js/${filename%.js}.optimized.js"
  test -s "$src" || { echo "Missing $src" >&2; exit 1; }
  node --check "$src"
  npx --yes terser@5.44.1 "$src" --compress --mangle --comments some --output "$dest"
  test -s "$dest" || { echo "Missing $dest" >&2; exit 1; }
  node --check "$dest"
  printf '%-35s %12s %12s\n' "$filename" "$(wc -c < "$src")" "$(wc -c < "$dest")"
done
echo "Syntax checks passed. Review generated files and browser interactions."
echo "IMPORTANT: Optimized JS is not referenced by index.html until separately reviewed."
