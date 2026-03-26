# Use Node.js LTS
FROM node:20-slim

# Install dependencies for better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the frontend
RUN npm run build

# Expose the port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
