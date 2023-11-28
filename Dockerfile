FROM node:18.14.1

# you'll likely want the latest npm, regardless of node version, for speed and fixes
RUN npm install npm@9.5.0 -g

# Install node dependencies
WORKDIR /opt/app

COPY . .

