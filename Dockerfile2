FROM telexy_botforwarder AS tbf
FROM microsoft_bfc:2.1.1 AS mbfc
# this wil add ping
RUN apt-get install -y iputils-ping
COPY --from=tbf /app /app/forwarder
COPY ./extensions/telexy /app/extensions/telexy
WORKDIR /app/extensions/telexy
RUN ["yarn", "run", "customizeImage" ]

WORKDIR /app/Composer
CMD ["yarn","start:server"]
