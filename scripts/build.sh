#!/usr/bin/env bash

set -e # exit when error

[ -z $CIRCLE_BUILD_NUM ] && CI='false' || CI='true'

if [ $CI == 'true' ]; then
  set -x # debug messages
fi

bundle='cliniasearch.helper'

echo "Build"

browserify index.js \
  --standalone cliniasearchHelper \
  --debug | \
  exorcist dist/cliniasearch.helper.js.map > dist/cliniasearch.helper.js

echo "..Minify"

uglifyjs dist/cliniasearch.helper.js \
  --mangle \
  --compress=warnings=false \
  --in-source-map "dist/cliniasearch.helper.js.map" \
  --source-map "dist/cliniasearch.helper.min.js.map" \
  --output dist/cliniasearch.helper.min.js

echo '..Gzipped file size'

echo "${bundle}.min.js gzipped will weigh" $(cat dist/"${bundle}".min.js | gzip -9 | wc -c | pretty-bytes)