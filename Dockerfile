FROM node:5.5-slim
MAINTAINER Michael R. Bernstein <mrb@codeclimate.com>

WORKDIR /usr/src/app/

COPY engine.json /
COPY package.json /usr/src/app/

ENV NODE_ENV production

RUN npm install

RUN useradd -u 9000 -r -s /bin/false app
USER app

COPY . /usr/src/app

CMD ["/usr/src/app/bin/fixme"]
