FROM node:lts-alpine

ARG version
ARG packages
ENV BUILD_PACKAGES=$packages
ENV RUN_MODE="production"

RUN apk add --no-cache bash curl && \
    npx create-docusaurus@$version -p npm -t docusaurus classic /opt && \
    chown -R node:node /opt/docusaurus

WORKDIR /opt/docusaurus

# Создаем директории
RUN mkdir -p /opt/docusaurus/config && \
    mkdir -p /opt/docusaurus/node_modules && \
    chown -R node:node /opt/docusaurus/config /opt/docusaurus/node_modules

COPY override.json merge.js ./
COPY entry.sh /

RUN chmod +x /entry.sh merge.js && \
    node merge.js && \
    echo "Content of package.json after merge:" && \
    cat package.json && \
    if [ -f install.flag ]; then \
        echo "Installing dependencies..." && \
        npm install --save && \
        rm install.flag; \
    else \
        echo "No install.flag found, skipping npm install"; \
    fi && \
    rm merge.js override.json && \
    cp package*.json /opt/docusaurus/config/ && \
    chown -R node:node /opt/docusaurus

EXPOSE 3000
USER node
ENTRYPOINT ["/entry.sh"]
