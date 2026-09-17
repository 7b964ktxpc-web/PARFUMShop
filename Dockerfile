FROM node:22-alpine

WORKDIR /app

COPY package.json bun.lockb ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
