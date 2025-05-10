FROM node:23-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
