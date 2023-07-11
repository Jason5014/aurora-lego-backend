FROM node:16-alpine
RUN mkdir -p /usr/src/app
RUN npm set registry https://registry.npm.taobao.org
RUN npm install -g npm
WORKDIR /usr/src/app
COPY package.json package.json ./
COPY yarn.lock yarn.lock ./
RUN yarn install --registry https://registry.npm.taobao.org
COPY . ./
RUN npm run tsc
EXPOSE 7001
CMD npx egg-scripts start --title=egg-server-aurora-lego-backend