FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts
COPY . .
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main"]
