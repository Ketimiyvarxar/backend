# ─── STAGE 1: Build ───────────────────────────────────────────────
FROM node:23-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY src/ ./src
COPY public/ ./public
COPY index.html ./index.html

RUN npm install

RUN npm run build

# ─── STAGE 2: Serve ──────────────────────────────────────────────
FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
