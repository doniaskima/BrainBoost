# Create image based on node alpine
FROM node:16.16-alpine3.16
# Change directory so that our commands run inside this new directory
WORKDIR /app
# Copy dependency definitions
COPY package.json ./
COPY npm.lock ./
# Install dependecies 
RUN npm install --immutable
# Get all the code needed to run the app
COPY . .
# Build app
RUN npm build
# Expose the port the app runs in
EXPOSE 8081
# Serve the app
CMD ["npm", "start:prod"]