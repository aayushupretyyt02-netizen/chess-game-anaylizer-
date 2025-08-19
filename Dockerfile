# Step 1: Node.js ka FULL image istemal karein
FROM node:18

# Step 2: Zaroori software (wget) install karein
RUN apt-get update && apt-get install -y wget

# Step 3: Container mein ek working directory banayein
WORKDIR /app

# Step 4: Dependencies install karne ke liye package files copy karein
COPY package*.json ./
RUN npm install

# Step 5: Baaki sabhi project files (server.js, etc.) ko copy karein
COPY . .

# Step 6: Stockfish ko download karein aur certificate check ko IGNORE karein
# "--no-check-certificate" flag add kiya gaya hai
RUN wget --no-check-certificate "https://download1509.mediafire.com/msgb80maasrgJNp42T8d_O84APKlXW3aPyqsgWg7AoF9sXdcXGgkk53FOL7t1cAc_9QyHudvQYvq2dh06lFM5hJxoAsAOA6gh3EVL-S6a6KY-hzWCcoleXjWD4giZ38lVd8ayw4pOiVZ8EFnu0uinPwNRh475gxly-Q9nUTYFB51hw/9ydfkvc5jyb79w1/stockfish-ubuntu-x86-64-avx2" -O ./stockfish && \
    chmod +x ./stockfish

# Step 7: Aapka server Port 3000 par chalta hai
EXPOSE 3000

# Step 8: Server start karne ki command
CMD ["npm", "start"]

