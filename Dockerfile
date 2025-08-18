# Use an official lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /src/app

# Copy dependency files 
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build 
RUN npm run build

# Expose the app port
EXPOSE 3000

# Run the compiled app
CMD ["npm", "start"]
