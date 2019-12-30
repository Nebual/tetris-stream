FROM node:12-stretch

WORKDIR /app/frontend

RUN wget -q https://github.com/krallin/tini/releases/download/v0.17.0/tini -O /tini && chmod +x /tini
ENTRYPOINT ["/tini", "--"]
CMD yarn && yarn run start
