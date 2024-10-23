FROM node:18-alpine

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ .

#EXPOSE 5173
EXPOSE 80

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
