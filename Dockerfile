FROM node

WORKDIR /usr/src/app

RUN npm install glob

COPY . /usr/src/app

CMD ["/usr/src/app/bin/fixme"]
