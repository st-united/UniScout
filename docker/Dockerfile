FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

EXPOSE 5001

CMD [ "yarn", "dev" ]
