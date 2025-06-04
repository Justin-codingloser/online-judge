#!/bin/bash

# 編譯 C++ 程式碼
g++ code.cpp -o code.out
if [ $? -ne 0 ]; then
    echo "編譯失敗"
    exit 1
fi

# 執行程式並傳入測資
./code.out < input.txt > output.txt