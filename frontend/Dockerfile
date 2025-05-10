# ─── STAGE 1: Build ───────────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

# 1) Copy only the files needed for install
COPY package.json vite.config.js ./

# 2) Install dependencies
RUN npm install

# 3) Copy the rest of your source
COPY public ./public
COPY src    ./src
COPY index.html ./

# 4) Build the production assets
RUN npm run build

# ─── STAGE 2: Serve ──────────────────────────────────────────────
FROM nginx:stable-alpine

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy the build over
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
