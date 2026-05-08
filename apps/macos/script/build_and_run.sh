#!/usr/bin/env bash
set -euo pipefail

APP_NAME="MacAltHub"
BUNDLE_ID="dev.macalthub.app"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT_DIR/../.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
BUNDLE_PATH="$DIST_DIR/$APP_NAME.app"
BINARY_PATH="$ROOT_DIR/.build/debug/$APP_NAME"
VERSION="$(tr -d '[:space:]' < "$REPO_ROOT/VERSION")"
BUILD_NUMBER="${BUILD_NUMBER:-1}"
VERIFY=false
PACKAGE_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --verify) VERIFY=true ;;
    --package-only) PACKAGE_ONLY=true ;;
  esac
done

pkill -x "$APP_NAME" >/dev/null 2>&1 || true

cd "$ROOT_DIR"
swift build

rm -rf "$BUNDLE_PATH"
mkdir -p "$BUNDLE_PATH/Contents/MacOS"
cp "$BINARY_PATH" "$BUNDLE_PATH/Contents/MacOS/$APP_NAME"
cat > "$BUNDLE_PATH/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>$APP_NAME</string>
  <key>CFBundleIdentifier</key>
  <string>$BUNDLE_ID</string>
  <key>CFBundleName</key>
  <string>$APP_NAME</string>
  <key>CFBundleShortVersionString</key>
  <string>$VERSION</string>
  <key>CFBundleVersion</key>
  <string>$BUILD_NUMBER</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>LSMinimumSystemVersion</key>
  <string>14.0</string>
  <key>NSPrincipalClass</key>
  <string>NSApplication</string>
</dict>
</plist>
PLIST

if [ "$PACKAGE_ONLY" = true ]; then
  echo "Packaged $BUNDLE_PATH ($VERSION build $BUILD_NUMBER)."
  exit 0
fi

/usr/bin/open -n "$BUNDLE_PATH"

if [ "$VERIFY" = true ]; then
  sleep 1
  pgrep -x "$APP_NAME" >/dev/null
  echo "$APP_NAME is running."
fi
