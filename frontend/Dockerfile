FROM node:22-alpine AS builder

RUN npm install -g npm@11

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN node node_modules/.bin/vite build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
