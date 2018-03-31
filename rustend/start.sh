#!/usr/bin/env bash
touch .trigger-successful-build
cargo watch -x check -s "touch .trigger-successful-build" &
./wait-for-it.sh db:5432 -q -- diesel setup && cargo watch --no-gitignore -w .trigger-successful-build -x run
