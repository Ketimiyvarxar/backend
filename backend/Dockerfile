FROM node:23-alpine
WORKDIR /usr/src/app

COPY . .
RUN npm install --omit=dev

ENV NODE_ENV=production
CMD ["node","app.js"]
