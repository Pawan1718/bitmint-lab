#!/usr/bin/env bash
# Optional, reproducible minification. Does not replace live script tags.
# Run from the repository root after installing Node/npm.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node and npm required for JS minification" >&2
  exit 1
fi

# Use an exact terser version. These files must be tested before swapping the
# website references; minification is intentionally opt-in.
for filename in webmint.js webmint-motion.js site-navigation.js contact-enquiry.js; do
  src="assets/js/$filename"
  dest="assets/js/${filename%.js}.optimized.js"
  npx --yes terser@5.44.1 "$src" --compress --mangle --comments some --output "$dest"
  echo "Minified: $src -> $dest"
done

echo "Review output and test runtime behavior before updating script tags."
