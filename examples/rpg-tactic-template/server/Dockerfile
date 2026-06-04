FROM node:20-alpine

WORKDIR /app

# Instalamos dependencias primero para aprovechar el cache
COPY examples/rpg-tactic-template/server/package*.json ./server/
RUN cd server && npm install

# Copiamos la integración y el servidor
COPY integration ./integration
COPY examples/rpg-tactic-template/server ./server

EXPOSE 3001

WORKDIR /app/server
CMD ["npm", "start"]
