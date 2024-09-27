# Base image for Node.js
FROM node:18-alpine

WORKDIR /app

COPY . .

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

EXPOSE 3000

CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"development\" ]; then npm run dev:build; else npm run build && npm run start; fi"]
