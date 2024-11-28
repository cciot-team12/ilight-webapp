# Use an ARM-compatible Node.js base image for Raspberry Pi
FROM node:18-bullseye-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on
EXPOSE 3001

# Start the server
CMD ["npm", "start"]