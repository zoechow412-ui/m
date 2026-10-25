FROM debian:bookworm-slim AS llama-build
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates cmake g++ make libcurl4-openssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN git clone https://github.com/ggml-org/llama.cpp.git . && git checkout b3fa69955ea81c3b60e77e3c1e2224c4a826ffb9
RUN cmake -B build -DCMAKE_BUILD_TYPE=Release -DGGML_NATIVE=OFF -DBUILD_SHARED_LIBS=OFF -DLLAMA_BUILD_TESTS=OFF -DLLAMA_BUILD_EXAMPLES=OFF -DLLAMA_BUILD_SERVER=ON && cmake --build build --target llama-server -j2
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl libgomp1 libcurl4 tini && rm -rf /var/lib/apt/lists/*
COPY --from=llama-build /src/build/bin/llama-server /usr/local/bin/llama-server
RUN mkdir -p /models && curl --fail --location --retry 3 'https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/bc640142c66e1fdd12af0bd68f40445458f3869b/Qwen3-4B-Q4_K_M.gguf' -o /models/qwen.gguf && echo '7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5  /models/qwen.gguf' | sha256sum -c -
WORKDIR /app
COPY dist /app/dist
COPY selfhost /app/selfhost
ENV PORT=10000 MODEL_BASE_URL=http://127.0.0.1:8081 MODEL_LABEL=Qwen3-4B-Q4_K_M
USER node
EXPOSE 10000
ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","selfhost/start.mjs"]
