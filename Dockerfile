FROM node:20-bullseye

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ="Europe/Kiev"


COPY package.json package-lock.json ./

RUN npm install

COPY . .


RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
