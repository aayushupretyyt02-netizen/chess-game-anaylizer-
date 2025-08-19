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
RUN wget --no-check-certificate "https://download1509.mediafire.com/w507tyah66ggYdpTp6pYngEyGDb5fwK59WGk_WF75pBK2Ap-aUYYBaNXxb9lPhdL1kJY8Vy3Lh21_y3dbuYFNSIb0h__Ib9OedsiZuF5oD4g_jPEHOOGdR_2Blkdu4q6XdJXJ2WX7bvgz_JYAMVHQhFCj6maY0zDUP6WGwk8jyYP_Q/9ydfkvc5jyb79w1/stockfish-ubuntu-x86-64-avx2" -O ./stockfish && \
    chmod +x ./stockfish

# Step 7: Render ko batayein ki server kaun sa port istemal karega
EXPOSE 10000

# Step 8: Server start karne ki command
CMD ["npm", "start"]
