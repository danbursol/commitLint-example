#!/usr/bin/env bash

ARG_DEFS=(
  "[--github_token=(.+)]"
)

function run() {
  echo "Installing dependencies"
  npm run install
  
  echo "Running version_updater and commit"
  node version_updater.js "${GITHUB_TOKEN}"
}

source $(dirname $0)/../base.inc
