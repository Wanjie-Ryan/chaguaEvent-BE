FROM node:16
WORKDIR /usr/src/eventsBE
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3005
CMD [ "node", "app.js" ]