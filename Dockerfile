FROM node:latest

WORKDIR /app

RUN apt-get update && apt-get install -y gcc g++

COPY backend /app/backend
COPY routes /app/routes
COPY models /app/models
COPY submissions /app/submissions
COPY frontend /app/frontend
COPY package.json /app/package.json
COPY .env /app/.env

RUN npm install

EXPOSE 3000

CMD ["node", "./backend/app.js"]