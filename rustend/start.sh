#!/usr/bin/env bash
touch .trigger-successful-build
cargo watch -x check --postpone -s "touch .trigger-successful-build && echo '' && echo ''" &
./wait-for-it.sh db:5432 -q -- \
    diesel setup \
    && diesel migration run \
    && cargo watch --no-gitignore -w .trigger-successful-build -x run
