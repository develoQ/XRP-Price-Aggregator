FROM node:16-slim
WORKDIR /asset

RUN apt-get update || : && apt-get install -y \
    python3 \
    build-essential

COPY package*.json .
RUN npm ci --production

COPY src/providers ./providers
COPY src/*.js .

