# Step 1: Use the official Node.js base environment
FROM node:18-slim

# Step 2: Install necessary software (wget for downloading, bzip2 for extracting)
RUN apt-get update && apt-get install -y wget bzip2

# Step 3: Create a working directory inside the container
WORKDIR /app

# Step 4: Copy package files to install dependencies
COPY package*.json ./
RUN npm install

# Step 5: Copy the rest of your project files (like server.js)
COPY . .

# Step 6: Download, extract, and set up a stable version of Stockfish
RUN wget https://stockfishchess.org/files/stockfish-15.1-linux-x86-64-avx2.tar.bz2 -O stockfish.tar.bz2 && \
    tar -xjvf stockfish.tar.bz2 && \
    mv stockfish-15.1-linux-x86-64-avx2/stockfish-15.1-linux-x86-64-avx2 ./stockfish && \
    chmod +x ./stockfish

# Step 7: Your server runs on Port 3000
EXPOSE 3000

# Step 8: The command to start your server
CMD ["npm", "start"]
