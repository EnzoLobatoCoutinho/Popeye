FROM node:20-alpine

RUN apk update && apk add nodejs npm

WORKDIR /app

COPY . /app

RUN npm install

RUN npm install express

EXPOSE 80

CMD [ "node", "server.js"]