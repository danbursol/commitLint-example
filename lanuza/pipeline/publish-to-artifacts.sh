#!/usr/bin/env bash

# Availabel in AZURE_ARTIFACTS_TOKEN by base.inc
ARG_DEFS=(
  "[--azure_artifacts_token=(.+)]"
)

function run() {
    echo "Exec: Script to publish sdk to azure artifacts"
    # TODO: Crear un container 
    docker compose build app
    # TODO: Una vez creado el container debemos ejecutar los scripts de publish en artifacts
    docker compose run app ./lanuza/scripts/publish-to-artifacts.sh --azure_artifacts_token="${AZURE_ARTIFACTS_TOKEN}"
}

source $(dirname $0)/../base.inc
