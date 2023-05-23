# Fetching the latest node image on alpine linux
FROM node:alpine AS development

# Declaring env
ENV NODE_ENV development

# Installing dependencies
COPY ./package.json .
COPY ./package-lock.json .

RUN npm ci

# Copying all the files in our project
COPY . .

# Starting our application
RUN npm run build
CMD npm start
