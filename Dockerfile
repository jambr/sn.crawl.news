FROM jambr/sn.nodejs:latest 

ENV APP_ENV docker
COPY . /app/
RUN npm install --production
