FROM node:20-alpine

WORKDIR /app

# Instalamos dependencias tanto de la integración como del servidor
COPY integration/package*.json ./integration/
COPY examples/rpg-tactic-template/server/package*.json ./server/

RUN cd integration && npm install
RUN cd server && npm install

COPY integration/ ./integration/
COPY examples/rpg-tactic-template/server/ ./server/

WORKDIR /app/server

EXPOSE 3001

CMD ["npm", "start"]
