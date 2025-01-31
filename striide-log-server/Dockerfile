# Use the official Node.js image from Docker Hub as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install the necessary dependencies
RUN npm install

# Copy the rest of your application code into the container
COPY . .

# Expose the port the app will run on (4001 in your case)
EXPOSE 4001

# Define the command to run the app
CMD ["node", "index.js"]
