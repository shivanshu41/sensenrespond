FROM --platform=linux/amd64 node:14
WORKDIR /PAGE
COPY ["package.json", "./"]
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 3001
# RUN chown -R node /usr/src/app
# USER node
CMD ["npm", "start"]