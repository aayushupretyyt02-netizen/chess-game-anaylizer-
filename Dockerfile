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

# Step 6: Stockfish ka STABLE version seedhe GITHUB se download karein
# Yeh link kabhi fail nahi hoga.
RUN wget https://github.com/official-stockfish/Stockfish/releases/download/sf_16/stockfish-ubuntu-x86-64-avx2.tar -O stockfish.tar && \
    tar -xvf stockfish.tar && \
    mv stockfish-*/stockfish . && \
    chmod +x ./stockfish && \
    # Check karein ki file maujood hai
    test -f ./stockfish || (echo "FATAL: Stockfish download failed." && exit 1)

# Step 7: Aapka server Port 3000 par chalta hai
EXPOSE 3000

# Step 8: Server start karne ki command
CMD ["npm", "start"]
