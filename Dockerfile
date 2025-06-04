# 使用 Ubuntu 作為基底映像
FROM ubuntu:latest

# 安裝必要工具
RUN apt-get update && apt-get install -y g++ && apt-get clean

# 設定工作目錄
WORKDIR /app

# 複製程式碼與腳本到容器
COPY . /app

# 確保腳本有執行權限
RUN chmod +x /app/run_code.sh

# 預設執行指令
CMD ["bash"]