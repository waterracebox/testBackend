#!/usr/bin/env bash
# 安裝相依套件
npm install

# 初始化資料表
node create_table.js

# 啟動後端
npm start
