#!/usr/bin/env bash
# Build the software
# Usually you will need to run it in an appropiate dev environment
#
# docker compose run app ./lanuza/scripts/publish-to-artifacts.sh

ARG_DEFS=(
  "[--azure_artifacts_token=(.+)]"
)

function publishNpm() {
  cd node
  echo "Installing Artifacts Pusblish tools"
  npm install -g vsts-npm-auth --registry https://registry.npmjs.com --always-auth false

  echo "Installing dependencies"
  npm run install
  
  echo "Build"
  npm run build

  # Set token in .npmrc to publish in azure artifacts

  echo "Publishing Artifacts"
  npm publish
}

function publishPip() {

}

function run() {
    publishPip();
    publishNpm();
}

source $(dirname $0)/../base.inc
