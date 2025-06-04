#!/bin/bash

# 檢查必要檔案是否存在
if [ ! -f code.cpp ]; then
    echo "錯誤：找不到 code.cpp"
    exit 1
fi

if [ ! -f input.txt ]; then
    echo "錯誤：找不到 input.txt"
    exit 1
fi

# 編譯 C++ 程式碼
g++ code.cpp -o code.out
if [ $? -ne 0 ]; then
    echo "編譯失敗"
    exit 1
fi

# 執行程式並傳入測資
./code.out < input.txt > output.txt