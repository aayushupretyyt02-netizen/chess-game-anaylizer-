# Step 1: Node.js ka FULL image istemal karein taaki saari zaroori files mil jaayein
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
# Aapka diya hua naya Mediafire link istemal kiya gaya hai
RUN wget --no-check-certificate "https://download1509.mediafire.com/smyrmugedt9g_L78J9k0YBflsD-6n8wXR312eLo3LsvGl6TNQVTzCXStKVUZTvnZm-CGlh7adba6O8kQ6HyMv2vLPLvbGtCM4To6FlQJbLjyLzsaA7pGCQIL1bYuSI_-Jd4NpVsSpO58pIjkZIfUjUYruEPUh688U2GLwg7el5LfrQ/9ydfkvc5jyb79w1/stockfish-ubuntu-x86-64-avx2" -O ./stockfish && \
    chmod +x ./stockfish

# Step 7: Render ko batayein ki server kaun sa port istemal karega
EXPOSE 10000

# Step 8: Server start karne ki command
CMD ["npm", "start"]
