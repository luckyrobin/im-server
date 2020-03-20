FROM node:10

# Create app directory
ADD . /im-server
WORKDIR /im-server

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# Bundle app source

EXPOSE 7001