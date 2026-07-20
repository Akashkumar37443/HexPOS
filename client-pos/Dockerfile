FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5173

# Dev server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
