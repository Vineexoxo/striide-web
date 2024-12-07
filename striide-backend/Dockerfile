FROM docker.io/rust:1-slim-bookworm AS build

RUN apt-get update && apt-get install -y pkg-config libssl-dev
# RUN apt-get -y install git-lfs

# RUN cat api/src/graph.json

# RUN git lfs install
# RUN git lfs pull

WORKDIR /build

COPY Cargo.toml ./
COPY src ./src
COPY api ./api
COPY application ./application
COPY infrastructure ./infrastructure
COPY models ./models
COPY shared ./shared

RUN cargo build --release

# FROM gcr.io/distroless/cc-debian12
FROM docker.io/debian:bookworm-slim
# RUN apt-get update && apt install -y openssl
RUN apt-get update && apt-get install -y openssl ca-certificates

WORKDIR /app

COPY --from=build /build/target/release/striide-backend ./
COPY --from=build /build/api/src/output.json.gz ./api/src/


ENV ROCKET_ADDRESS=0.0.0.0
ENV ROCKET_PORT=8080

CMD ["./striide-backend"]