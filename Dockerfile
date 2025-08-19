# Step 1: Node.js ka FULL image istemal karein taaki saari zaroori files mil jaayein
FROM node:18

# Step 2: Zaroori software (wget, tar) install karein
RUN apt-get update && apt-get install -y wget tar

# Step 3: Container mein ek working directory banayein
WORKDIR /app

# Step 4: Dependencies install karne ke liye package files copy karein
COPY package*.json ./
RUN npm install

# Step 5: Baaki sabhi project files (server.js, etc.) ko copy karein
COPY . .

# Step 6: Stockfish ka LATEST version seedhe GITHUB se download karein (sabse stable tareeka)
RUN wget https://github.com/official-stockfish/Stockfish/releases/latest/download/stockfish-ubuntu-x86-64-avx2.tar -O stockfish.tar && \
    tar -xvf stockfish.tar && \
    # Sahi file ko move aur rename karein
    mv stockfish/stockfish-ubuntu-x86-64-avx2 ./stockfish && \
    chmod +x ./stockfish && \
    # Aakhri check
    test -f ./stockfish || (echo "FATAL: Stockfish setup failed." && exit 1)

# Step 7: Render ko batayein ki server kaun sa port istemal karega
EXPOSE 10000

# Step 8: Server start karne ki command
CMD ["npm", "start"]
