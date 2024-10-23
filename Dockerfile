FROM node:18-alpine AS frontend

WORKDIR /app/frontend

COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./
RUN npm install && npm install -g pnpm && pnpm install

COPY ./frontend ./
RUN pnpm run build

FROM node:18-alpine AS backend

WORKDIR /app/backend

COPY ./backend/package.json ./backend/pnpm-lock.yaml ./
RUN npm install && npm install -g pnpm && pnpm install

COPY ./backend ./

COPY --from=frontend /app/frontend/dist ./public

EXPOSE 3000

ENV VITE_NAME=$VITE_NAME

CMD ["pnpm", "start"]
