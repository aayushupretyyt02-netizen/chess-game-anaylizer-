# Step 1: Node.js ka base environment istemal karein
FROM node:18-slim

# Step 2: Zaroori software (wget, bzip2) install karein
RUN apt-get update && apt-get install -y wget bzip2

# Step 3: Container mein ek working directory banayein
WORKDIR /app

# Step 4: Dependencies install karne ke liye package files copy karein
COPY package*.json ./
RUN npm install

# Step 5: Baaki sabhi project files (server.js, etc.) ko copy karein
COPY . .

# Step 6: Sabse SOLID tareeka Stockfish download karne ka
# Yeh pehle naya version (16.1) try karega.
# Agar woh fail hua, to purana stable version (15.1) try karega.
RUN ( \
      echo "Trying to download Stockfish 16.1..." && \
      wget https://stockfishchess.org/files/stockfish-16.1-linux-x86-64-avx2.tar.bz2 -O stockfish.tar.bz2 && \
      tar -xjvf stockfish.tar.bz2 && \
      mv stockfish-16.1-linux-x86-64-avx2/stockfish . && \
      echo "Success: Stockfish 16.1 installed." \
    ) || ( \
      echo "Warning: Failed to get Stockfish 16.1. Trying fallback version 15.1..." && \
      wget https://stockfishchess.org/files/stockfish-15.1-linux-x86-64-avx2.tar.bz2 -O stockfish.tar.bz2 && \
      tar -xjvf stockfish.tar.bz2 && \
      mv stockfish-15.1-linux-x86-64-avx2/stockfish-15.1-linux-x86-64-avx2 ./stockfish && \
      echo "Success: Fallback Stockfish 15.1 installed." \
    ) && \
    # Dono mein se koi ek success hone ke baad, file ko chalane ki permission do
    chmod +x ./stockfish && \
    # Aakhri check, agar abhi bhi file nahi hai to build fail karo
    test -f ./stockfish || (echo "FATAL: All attempts to download Stockfish failed." && exit 1)

# Step 7: Aapka server Port 3000 par chalta hai
EXPOSE 3000

# Step 8: Server start karne ki command
CMD ["npm", "start"]
