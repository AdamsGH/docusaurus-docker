#!/bin/bash

log() {
    echo -E "/* $1 */"
}

log "Checking configuration..."

# Проверяем конфигурацию в config volume
if [ -s /opt/docusaurus/config/package.json ]; then
    log "Using configuration from volume"
    cp /opt/docusaurus/config/package*.json /opt/docusaurus/
else
    log "Initializing configuration volume"
    # Копируем сгенерированный при сборке package.json в volume
    cp /opt/docusaurus/package*.json /opt/docusaurus/config/
fi

run_docusaurus() {
    local cmd="npm run $1"
    shift
    
    if [ $# -gt 0 ]; then
        cmd="$cmd -- $*"
    fi
    
    eval "$cmd &"
    return $!
}

log "Starting in $RUN_MODE mode"

case "${RUN_MODE,,}" in
    development|dev)
        args="--host 0.0.0.0"
        [[ -n "$DEV_LOCALE" ]] && args="$args --locale $DEV_LOCALE"
        run_docusaurus start $args
        ;;
    production|prod)
        log "Build current sources..."
        run_docusaurus serve --build --host 0.0.0.0
        ;;
    *)
        log "This \"$RUN_MODE\" mode is unknown as a default Node.js service mode. You should do know what you do."
        npm run "$RUN_MODE" &
        ;;
esac

[[ "$!" -gt 0 ]] && wait $!
