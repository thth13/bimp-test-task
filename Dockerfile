FROM node:24-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json yarn.lock ./
COPY tsconfig.json ./

RUN yarn install

COPY src ./src
RUN yarn build  # "build": "tsc"

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/dist ./dist

RUN yarn install --production --frozen-lockfile

CMD ["node", "dist/index.js"]
