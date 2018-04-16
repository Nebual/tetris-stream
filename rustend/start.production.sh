#!/usr/bin/env sh
/app/rustend/wait-for-it.sh db:5432 -q -- \
    && /app/rustend/tetris-stream
