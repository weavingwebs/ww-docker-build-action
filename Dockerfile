FROM docker:stable

RUN apk add --no-cache nodejs yarn

COPY . /ww-docker-build
RUN cd /ww-docker-build && yarn --frozen-lockfile

ENTRYPOINT ["/ww-docker-build/entrypoint.sh"]
