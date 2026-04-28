#!/usr/bin/env bash
# Builds all packages and copies the dist files into assets/lib/
# so that index.html can load Interact and Presets from local bundles.
#
# Usage:
#   yarn workspace @wix/interact build:landing   (from anywhere in the repo)
#   ./scripts/build-landing.sh                    (from repo root)

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
LIB_DIR="$REPO_ROOT/assets/lib"

yarn workspaces foreach --all --topological --include 'packages/*' run build

rm -rf "$LIB_DIR/interact" "$LIB_DIR/motion-presets" "$LIB_DIR/motion"

mkdir -p "$LIB_DIR/interact/es"
mkdir -p "$LIB_DIR/motion-presets"
mkdir -p "$LIB_DIR/motion"

cp "$REPO_ROOT/packages/interact/dist/es/web.js" "$LIB_DIR/interact/es/"
cp "$REPO_ROOT/packages/interact/dist"/index-*.mjs "$LIB_DIR/interact/"
cp "$REPO_ROOT/packages/motion-presets/dist/es/motion-presets.js" "$LIB_DIR/motion-presets/"
cp "$REPO_ROOT/packages/motion/dist/es/motion.js" "$LIB_DIR/motion/"

echo "Landing page libraries copied to assets/lib/"
