#!/usr/bin/env bash

# Availabel in AZURE_ARTIFACTS_TOKEN by base.inc
ARG_DEFS=(
  "[--github_token=(.+)]"
)

function run() {
    echo "Exec: Script to change versions dynamicly"
    # TODO: Crear un container 
    docker compose build app
    # TODO: Una vez creado el container debemos ejecutar los scripts de publish en artifacts
    docker compose run app ./lanuza/scripts/dynamic-version.sh --github_token="${GITHUB_TOKEN}"
}

source $(dirname $0)/../base.inc
