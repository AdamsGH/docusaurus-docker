---
title: docker
description: А как это сделать удобно?
tags:
  - docker
  - docusaurus
---

Если мы обратимся к официальной документации, то в блоке запуска проекта заметим, что у нас есть два пути

- Запуск окружения через `npm run start`
- Полноценная сборка проекта через `npm run build`

Нам пригодятся оба из них. В первом случае - мы запускаем dev окружение, которое практически в режиме реального времени позволяет нам видеть выносимые на сайт изменения, будь то наши документы или файлы конфигурации. На время первичной настройки или кастомизации - незаменимая вещь, но разумеется есть и свои минусы

- В рамках dev окружения можно запустить только одну локализацию из i18n, смена языка работать не будет
- Некоторые плагины не будут работать до полноценной сборки, например поиск по сайту

Метод установки в Docker от community весьма неплохо выполнен, но там нам предлагается пересобирать образ в зависимости от того, production или development окружение мы выбираем. На мой вкус - это крайне неудобно.

## Цели
Резюмируем что хочется видеть в удобном развёртывании с использованием docker контейнера
- Отсутствие необходимости ставить npm модули на хостовую машину
- Один образ для запуска dev и prod окружения
- Возможность установки дополнительных зависимостей по мере использования без хардкода оных в Dockerfile
- Возможность указать необходимую для сборки версию Docusaurus
- Минимизировать количество телодвижений для обновления

## Реализация
 Все проекты мне привычно разворачивать с использованием `docker compse`, так что всё описанное ниже опирается на его применение. Если вам по каким-либо причинам необходимо использовать `docker run` - это не составит больших проблем, но вам придётся немного подправить команды и конфиги под свои нужды.

### Настройки
Для настройки проекта нет необходимости ничего менять в файлах докера, разве что вы захотите поменять пути монтирования папок. Вся конфигурация должна быть указана в `.env` файле, например 

```ini
version=3.2.1
mode=dev
locale=ru
packages="@docusaurus/theme-mermaid @easyops-cn/docusaurus-search-local"
```

|   env    | required | default    |
|:--------:| -------- | ---------- |
| version  | +        | 3.6.0      |
|   mode   | +        | production |
|  locale  | +        |            |
| packages | -        |            |

Я использую реализацию, в которой у меня будет развёрнута сразу как dev, так и prod версия, доступ к которым настраивается на уровне reverse proxy. Ничто не мешает развернуть и отдельно только нужную.

```yaml
x-common-config: &common-config
  build:
    context: ./src
    args:
      - version=${version:-3.6.0}
      - packages=${packages:-}
  image: docusaurus:${version:-3.6.0}
  volumes:
      - ./files:/opt/docusaurus:rw
      - /opt/docusaurus/node_modules
      - /opt/docusaurus/config
  healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
  environment: &common-env
    BUILD_PACKAGES: ${packages:-}

services:
  docusaurus:
    <<: *common-config
    container_name: docusaurus
    ports:
      - 3152:3000
    environment:
      <<: *common-env
      RUN_MODE: ${mode}
      DEV_LOCALE: ${locale:-en}

  docusaurus-dev:
    <<: *common-config
    container_name: docusaurus-dev
    ports:
      - 3153:3000
    environment:
      <<: *common-env
      RUN_MODE: dev
      DEV_LOCALE: en
```
### Dockerfile

Т.к. мы монтируем всю папку files - нам необходимо отдельно оставить внутри контейнера некоторые папки/файлы, которые нужны только для сборки - в нашем случае это `node_modules` и файлы `package*.json`

```dockerfile
FROM node:lts-alpine

ARG version
ARG packages
ENV BUILD_PACKAGES=$packages
ENV RUN_MODE="production"

RUN apk add --no-cache bash curl && \
    npx create-docusaurus@$version -p npm -t docusaurus classic /opt && \
    chown -R node:node /opt/docusaurus

WORKDIR /opt/docusaurus

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
```

### Скрипты

Для себя я так же добавил два скрипта, entry.sh и merges.js - их можно найти в github репозитории. Первый из оных помогает выбрать нужную сборку (dev/prod), а второй отвечает за добавление в `package.json` данных из файла `override.json` - он позволяет установить дополнительные пакеты или перезаписать уже имеющиеся, а попутно отвечает за обработку переменной `packages`. Так же в репозитории можно найти автоматизацию с использованием just файла, что здорово упростит жизнь =) 