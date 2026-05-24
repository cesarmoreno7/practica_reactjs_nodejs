# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY client/package*.json ./client/

RUN npm ci
RUN npm --prefix client ci

COPY . .
RUN npm --prefix client run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY config ./config
COPY controllers ./controllers
COPY middleware ./middleware
COPY models ./models
COPY routes ./routes
COPY utils ./utils
COPY server.js ./
COPY client/dist ./client/dist

EXPOSE 3000
CMD ["npm", "start"]
