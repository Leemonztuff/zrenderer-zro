FROM node:20-alpine

WORKDIR /app

# Copiar dependencias de integración y del servidor
COPY integration/package.json ./integration/
COPY examples/rpg-tactic-template/server/package.json ./server/

# Instalar dependencias
WORKDIR /app/server
RUN npm install

# Copiar el resto del código
WORKDIR /app
COPY integration ./integration
COPY examples/rpg-tactic-template/server ./server

WORKDIR /app/server
EXPOSE 3001

CMD ["npm", "start"]
