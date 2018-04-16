#!/usr/bin/env sh
/app/rustend/wait-for-it.sh db:5432 -q -- \
    diesel setup \
    && diesel migration run \
    && /app/rustend/tetris-stream
