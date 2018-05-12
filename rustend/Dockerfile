FROM buildpack-deps:stretch

# Rust toolchain (nightly)
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN set -eux; \
    wget -q "https://static.rust-lang.org/rustup/dist/x86_64-unknown-linux-gnu/rustup-init"; \
    chmod +x rustup-init; \
    ./rustup-init -y --no-modify-path --default-toolchain nightly-2018-04-10; \
    rm rustup-init; \
    chmod -R a+w $RUSTUP_HOME $CARGO_HOME;

RUN wget -q https://github.com/krallin/tini/releases/download/v0.17.0/tini -O /tini && chmod +x /tini

RUN cargo install cargo-watch
RUN cargo install diesel_cli --no-default-features --features postgres

RUN apt update && apt install -y \
    socat \
    && apt clean

# Rust libraries
WORKDIR /app/rustend
COPY Cargo.toml Cargo.lock /app/rustend/
RUN mkdir src target && touch src/lib.rs && cargo fetch && rm -rf src
VOLUME ["/usr/local/cargo"]

COPY .gitignore wait-for-it.sh start.sh /app/rustend/
ENTRYPOINT ["/tini", "--"]
CMD ["/app/rustend/start.sh"]
