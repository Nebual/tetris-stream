FROM node:9.9-stretch

# React libraries
RUN yarn global add serve
COPY package.json /app/frontend/package.json
COPY yarn.lock /app/frontend/yarn.lock
WORKDIR /app/frontend
RUN yarn
EXPOSE 8080


# React build
COPY . /app/frontend


# Production-ish
#RUN yarn build
#CMD ["serve", "-p", "8080", "-s", "/app/frontend/build"]


CMD ["yarn", "run", "start"]
