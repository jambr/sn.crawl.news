FROM jambr/sn.nodejs:latest 

ENV APP_ENV docker
COPY package.json /app/
RUN npm install --production

COPY . /app/
