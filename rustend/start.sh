#!/usr/bin/env bash

# Launch proxy between outside port 80, and the server's port 81, so requests made while server is restarting wait instead of failing
socat TCP-LISTEN:80,fork TCP:localhost:81,retry=10 &

touch .trigger-successful-build
if [[ -z "${USEPOLLING}" ]]; then
    POLLING=""
else
    POLLING="--poll"
fi
cargo watch ${POLLING} -x check --postpone -s "touch .trigger-successful-build && echo '' && echo ''" &
./wait-for-it.sh db:5432 -q -- \
    diesel setup \
    && diesel migration run \
    && cargo watch --no-gitignore -w .trigger-successful-build -x run
