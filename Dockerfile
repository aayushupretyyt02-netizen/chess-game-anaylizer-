# Step 1: Node.js ka base environment istemal karein
FROM node:18-slim

# Step 2: Zaroori software (wget) install karein
RUN apt-get update && apt-get install -y wget

# Step 3: Container mein ek working directory banayein
WORKDIR /app

# Step 4: Dependencies install karne ke liye package files copy karein
COPY package*.json ./
RUN npm install

# Step 5: Baaki sabhi project files (server.js, etc.) ko copy karein
COPY . .

# Step 6: Stockfish ki ek file SEEDHE download karein
# Aapka diya hua direct link. Isko hum "stockfish" naam se save karenge.
RUN wget "https://download1509.mediafire.com/27ltc2sll6zgVW3743OZE-sDdRltVI6WmmQTbNoBX6S8Hf3EgOn-JJbG6OGKNlgy1xFG-bXS-X896NQshFfak-1LBc69DpR0aBby8F47VZIFgrqKwxCHhnzobQ7R-wPKU523cyzhwbFkbOyuJnVfVAGy5F1QY8aHMFEH-cX66e-cmA/9ydfkvc5jyb79w1/stockfish-ubuntu-x86-64-avx2" -O ./stockfish && \
    chmod +x ./stockfish

# Step 7: Aapka server Port 3000 par chalta hai
EXPOSE 3000

# Step 8: Server start karne ki command
CMD ["npm", "start"]
