ARG MONGODB_URL
ARG MONGODB_USER
ARG MONGODB_PASS

FROM google/nodejs

LABEL maintainer="ekl@ntu.im"

ADD . /var/www/
WORKDIR /var/www/

RUN npm install --silent

ENV MONGODB_URL=${MONGODB_URL}
ENV MONGODB_USER=${MONGODB_USER}
ENV MONGODB_PASS=${MONGODB_PASS}

CMD []
ENTRYPOINT ["node", "bin/www"]
