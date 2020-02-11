#!/usr/bin/env bash

set -e # exit when error

[ -z $CIRCLE_BUILD_NUM ] && CI='false' || CI='true'

if [ $CI == 'true' ]; then
  set -x # debug messages
fi

bundle='search.helper'

echo "Build"

mkdir -p dist

browserify index.js \
  --standalone searchHelper \
  --debug | \
  exorcist dist/search.helper.js.map > dist/search.helper.js

echo "..Minify"

uglifyjs dist/search.helper.js \
  --mangle \
  --compress=warnings=false \
  --in-source-map "dist/search.helper.js.map" \
  --source-map "dist/search.helper.min.js.map" \
  --output dist/search.helper.min.js

echo '..Gzipped file size'

echo "${bundle}.min.js gzipped will weigh" $(cat dist/"${bundle}".min.js | gzip -9 | wc -c | pretty-bytes)
