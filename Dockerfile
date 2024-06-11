
FROM node:20
WORKDIR /
COPY . .
RUN npm install 
CMD ["node", "server.mjs"]
EXPOSE 5000