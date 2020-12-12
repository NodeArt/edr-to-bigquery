# syntax = docker/dockerfile:1.1.7-experimental

FROM registry-1.docker.io/library/node:14.5.0-stretch-slim AS declare-node-stage

FROM declare-node-stage AS create-working-directory
ENV WORKDIR='/opt/app'
WORKDIR ${WORKDIR}

FROM create-working-directory AS enable-package-caching
ENV DEBIAN_FRONTEND='noninteractive'
RUN rm -f /etc/apt/apt.conf.d/docker-clean; \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache

FROM enable-package-caching AS prepare-node-environment
ENV NODE_OPTIONS='--max_old_space_size=6144'

FROM prepare-node-environment AS install-system-dependencies
ENV BASIC_DEPS='ca-certificates apt-transport-https curl' \
    BUILD_DEPS='build-essential g++ python make git gnupg' \
    CWEBP_DEPS='libglu1 libxi6 libjpeg62 libpng16-16'
ENV DEPS="${BASIC_DEPS} ${BUILD_DEPS} ${CWEBP_DEPS}"
RUN --mount=type=cache,target=/var/cache/apt,id=apt-cache_cache,sharing=locked \
    --mount=type=cache,target=/var/cache/debconf,id=debconf-cache_cache,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,id=apt-lib_cache,sharing=locked \
    apt -y update && apt -y install --no-install-recommends ${DEPS}

FROM install-system-dependencies AS install-latest-npm
RUN --mount=type=cache,target=/root/.npm,id=npm_cache,sharing=locked \
    --mount=type=cache,target=/tmp,id=npm_releases,sharing=locked \
    npm --prefer-offline install npm --global --silent

FROM install-latest-npm AS prepare-export-environment
ARG BQ_CLIENT_ID
ARG BQ_CLIENT_EMAIL
ARG BQ_PRIVATE_KEY
ARG BQ_PROJECT_ID
ARG BQ_DATASET_ID
ARG RUN_ID
ENV NODE_ENV='production'

FROM prepare-export-environment AS install-project-dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm,id=npm_cache,sharing=locked \
    --mount=type=cache,target=/tmp,id=npm_releases,sharing=locked \
    npm --prefer-offline ci --silent

FROM install-project-dependencies as export-edr
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=bind,source=/opt/app/node_modules,target=node_modules,from=install-project-dependencies \
    --mount=type=bind,source=config,target=config \
    --mount=type=bind,source=bigquery.js,target=bigquery.js \
    --mount=type=bind,source=index.js,target=index.js \
    npm start

FROM scratch AS jobs-done
COPY --from=export-edr /tmp /tmp

LABEL org.opencontainers.image.description="" \
      org.opencontainers.image.is-production="true" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.component="bq" \
      org.opencontainers.image.repository="" \
      org.opencontainers.image.project="" \
      org.opencontainers.image.namespace="" \
      org.opencontainers.image.registry="" \
      org.opencontainers.image.vendor="" \
      org.opencontainers.image.documentation="https://github.com" \
      org.opencontainers.image.source="https://github.com" \
      org.opencontainers.image.url="https://github.com" \
      org.opencontainers.image.title="" \
      org.opencontainers.image.licenses=""