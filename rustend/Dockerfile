FROM buildpack-deps:stretch

# Rust toolchain (nightly)
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN set -eux; \
    wget "https://static.rust-lang.org/rustup/dist/x86_64-unknown-linux-gnu/rustup-init"; \
    chmod +x rustup-init; \
    ./rustup-init -y --no-modify-path --default-toolchain nightly; \
    rm rustup-init; \
    chmod -R a+w $RUSTUP_HOME $CARGO_HOME;

RUN cargo install watchexec

# Rust libraries
COPY Cargo.toml Cargo.lock /app/rustend/
WORKDIR /app/rustend
RUN mkdir src && touch src/lib.rs && cargo build --lib && rm -rf src
EXPOSE 8000

# Rust build
COPY . /app/rustend
WORKDIR /app/rustend
RUN cargo build

CMD ["watchexec", "--exts", ".rs", "--restart", "cargo run"]
