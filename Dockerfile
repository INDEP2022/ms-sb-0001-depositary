#FROM node:12.19.0-alpine3.9 AS development
FROM node:16.13.1 AS development

RUN apt-get update \
  # had to install tzdata this first to get the noninteractive to work
  && DEBIAN_FRONTEND="noninteractive" apt-get install -y --no-install-recommends tzdata \
  && apt-get install -y curl gnupg build-essential libcurl4-openssl-dev openssh-client git\
  && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
  #&& apt-get remove -y --purge cmdtest \
  && apt-get update \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /var/lib/apt/lists.d/* \
  && apt-get autoremove \
  && apt-get clean \
  && apt-get autoclean

#RUN adduser --disabled-password --gecos "" --uid 1000 node

#RUN chown -R node:node /usr/src/app

#USER node

# had to set mode to 0700 otherwise couldn't open .ssh director to write known_hosts file
RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
#RUN mkdir -p /usr/src/app/node_modules && chown -R node:node /usr/src/app

WORKDIR /usr/src/app

COPY package.json ./

# had to allow uid=1000 access for this to work
#RUN --mount=type=ssh,uid=1000 npm ci

#COPY --chown=node:node . .

#WORKDIR /usr/src/app

#COPY package*.json ./

RUN npm install glob rimraf
RUN npm install --only=development

COPY . .

RUN npm run build

#FROM node:12.19.0-alpine3.9 as production
FROM node:16.13.1 AS production
 
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]