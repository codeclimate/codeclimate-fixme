FROM node:6-alpine

WORKDIR /usr/src/app/

COPY engine.json /
COPY package.json /usr/src/app/

# Install dependencies:
RUN apk add --no-cache --virtual .run-deps grep && npm install

RUN adduser -u 9000 -S -s /bin/false app
USER app

COPY . /usr/src/app

VOLUME /code
WORKDIR /code

CMD ["/usr/src/app/bin/fixme"]
