# Step 1: Use the FULL Node.js image to include all necessary system libraries
FROM node:18

# Step 2: Install wget for downloading
RUN apt-get update && apt-get install -y wget

# Step 3: Create a working directory inside the container
WORKDIR /app

# Step 4: Copy package files to install dependencies
COPY package*.json ./
RUN npm install

# Step 5: Copy the rest of your project files (like server.js)
COPY . .

# Step 6: Download the Stockfish executable using your Mediafire link
# The "-O ./stockfish" part saves it with the simple name "stockfish"
RUN wget "https://download1509.mediafire.com/27ltc2sll6zgVW3743OZE-sDdRltVI6WmmQTbNoBX6S8Hf3EgOn-JJbG6OGKNlgy1xFG-bXS-X896NQshFfak-1LBc69DpR0aBby8F47VZIFgrqKwxCHhnzobQ7R-wPKU523cyzhwbFkbOyuJnVfVAGy5F1QY8aHMFEH-cX66e-cmA/9ydfkvc5jyb79w1/stockfish-ubuntu-x86-64-avx2" -O ./stockfish && \
    chmod +x ./stockfish

# Step 7: Your server will run on Port 3000
EXPOSE 3000

# Step 8: The command to start your server
CMD ["npm", "start"]
