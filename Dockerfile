FROM node:18-slim

WORKDIR  /usr/src/app

# Enable corepack for using pnpm
RUN corepack enable 

COPY package.json pnpm-lock.yaml .npmrc ./

RUN pnpm install --frozen-lockfile

COPY . .

CMD [ "node", "index.js"  ]
