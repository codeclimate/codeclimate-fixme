FROM node

MAINTAINER Michael R. Bernstein

RUN useradd -u 9000 -r -s /bin/false app

ENV NODE_ENV production

RUN npm install

WORKDIR /code
COPY . /usr/src/app
COPY engine.json /

USER app
VOLUME /code

CMD ["/usr/src/app/bin/fixme"]
