# Use an official Node.js 18+ image as the base
FROM node:18-alpine

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application files to the working directory
COPY . .

# Step 6: Expose port 3000
EXPOSE 3000

# Step 7: Start the React app
CMD ["npm", "run", "dev"]
