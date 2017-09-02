FROM node:6-alpine
MAINTAINER Michael R. Bernstein <mrb@codeclimate.com>

WORKDIR /usr/src/app/

COPY engine.json /
COPY package.json /usr/src/app/

RUN npm install

RUN adduser -u 9000 -S -s /bin/false app
USER app

COPY . /usr/src/app

VOLUME /code
WORKDIR /code

CMD ["/usr/src/app/bin/fixme"]
