# List available commands
default:
    @just --list

# Variables
prod := "docusaurus"
dev := "docusaurus-dev"

# Get service name
get-service-name service="":
    #!/usr/bin/env bash
    if [ "{{service}}" = "" ]; then
        echo ""
    elif [ "{{service}}" = "prod" ]; then
        echo "{{prod}}"
    else
        echo "{{dev}}"
    fi

# Start service (usage: just up [prod|dev])
up service="":
    @docker compose up $(just get-service-name {{service}}) -d

# Stop service (usage: just down [prod|dev])
down service="":
    @docker compose stop $(just get-service-name {{service}})

# View logs (usage: just logs [prod|dev])
logs service="":
    @docker compose logs -f $(just get-service-name {{service}})

# Rebuild service (usage: just build [prod|dev] [--no-cache])
build service="" *args="":
    @docker compose build {{args}} $(just get-service-name {{service}})

# Copy template files from container (usage: just copy-template [version])
copy-template version="3.6.1": (build)
    #!/usr/bin/env bash
    CID=$(docker create docusaurus:{{version}}) && \
    docker cp $CID:/opt/docusaurus /opt/docusaurus/docusaurus_template_{{version}} && \
    docker rm $CID && \
    ln -sr /opt/docusaurus/docusaurus_template_{{version}} /docker/docusaurus/_stash/template

# Rebuild and restart service (usage: just rebuild [prod|dev] [--no-cache])
rebuild service="" *args="": (down service) (build service args) (up service)

# Restart service (usage: just restart [prod|dev])
restart service="":
    @docker compose up -d --force-recreate $(just get-service-name {{service}})

# Remove service containers and volumes (usage: just clean [prod|dev])
clean service="":
    @docker compose rm -f -v $(just get-service-name {{service}})

# Start development environment 
dev:
    @just up dev

# Start production environment
prod:
    @just up prod
