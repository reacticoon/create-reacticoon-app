#!/usr/bin/env bash

./fix_node_modules

cd reacticoon-plugins/

cd create-reacticoon-plugin && yarn install
cd reacticoon-plugin-bundle-stats   && yarn install ; cd ..
cd reacticoon-plugin-example          && yarn install ; cd ..
cd reacticoon-plugin-git     && yarn install ; cd ..
cd reacticoon-plugin-history     && yarn install ; cd ..
cd reacticoon-plugin-material-ui   && yarn install ; cd ..
cd reacticoon-plugin-testing && yarn install ; cd ..
cd reacticoon-plugin-ci && yarn install ; cd ..
cd reacticoon-plugin-flash-messages   && yarn install ; cd ..
cd reacticoon-plugin-helmet   && yarn install ; cd ..
cd reacticoon-plugin-lighthouse   && yarn install ; cd ..
cd reacticoon-plugin-mock-api && yarn install ; cd ..
cd reacticoon-plugin-validation && yarn install ; cd ..
cd reacticoon-plugin-dev && yarn install ; cd ..
cd reacticoon-plugin-form && yarn install ; cd ..
cd reacticoon-plugin-hibp  && yarn install ; cd ..
cd reacticoon-plugin-logger && yarn install ; cd ..
cd reacticoon-plugin-sentry && yarn install ; cd ..
