# Use the official Node.js 20 image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists) to install dependencies
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port your app runs on (from .env, default 5000)
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]