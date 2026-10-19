#!/usr/bin/env bash
# Sign an archive built with CODE_SIGNING_ALLOWED=NO "to run locally" (ad hoc),
# with the app's and the widget's entitlements, so `xcodebuild -exportArchive`
# can re-sign it with Apple's cloud-managed distribution certificate.
# CI never needs a development certificate this way (each CI run used to
# create a new one through the API key, until the account hit its limit).
#   usage: adhoc-sign-archive.sh <path/to/App.xcarchive> <ios|mac>
set -euo pipefail
archive="$1"
platform="$2"
ios_dir="$(cd "$(dirname "$0")/../ios/App" && pwd)"
app="$archive/Products/Applications/App.app"

if [ "$platform" = mac ]; then
  contents="$app/Contents"
  app_ent="$ios_dir/App/App-macOS.entitlements"
  widget_ent="$ios_dir/TinyMotivateWidget/TinyMotivateWidget-macOS.entitlements"
else
  contents="$app"
  app_ent="$ios_dir/App/App.entitlements"
  widget_ent="$ios_dir/TinyMotivateWidget/TinyMotivateWidget.entitlements"
fi

sign() { codesign --force --sign - --timestamp=none "$@"; }

# inside out: frameworks, then the widget, then the app
if [ -d "$contents/Frameworks" ]; then
  find "$contents/Frameworks" -maxdepth 1 \( -name '*.framework' -o -name '*.dylib' \) -print0 |
    while IFS= read -r -d '' f; do sign "$f"; done
fi
sign --entitlements "$widget_ent" --generate-entitlement-der "$contents/PlugIns/TinyMotivateWidget.appex"
sign --entitlements "$app_ent" --generate-entitlement-der "$app"
codesign --verify --deep --strict "$app"
echo "ad hoc signed $app"
