FROM node:18-slim

WORKDIR  /usr/src/app

# Enable corepack for using pnpm
RUN corepack enable 

COPY package.json .npmrc ./

RUN pnpm install 

COPY . .

CMD [ "node", "index.js"  ]
