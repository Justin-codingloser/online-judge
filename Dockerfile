# 使用官方的 C++ 編譯器映像檔
FROM gcc:latest

# 設定工作目錄
WORKDIR /app

# 複製必要的檔案到容器中
COPY backend /app/backend
COPY routes /app/routes
COPY models /app/models
COPY submissions /app/submissions
COPY frontend /app/frontend
COPY package.json /app/package.json
COPY .env /app/.env

# 安裝必要的 Node.js 依賴項
RUN apt-get update && apt-get install -y nodejs npm

# 安裝專案依賴項
RUN npm install

# 暴露伺服器埠
EXPOSE 3000

# 啟動應用程式
CMD ["node", "./backend/app.js"]