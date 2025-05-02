const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("../routes/auth");
const problemRoutes = require("../routes/problem");
const submitRoutes = require("../routes/submit");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submit", submitRoutes);

// MongoDB 連接（先用本地測試資料庫）
mongoose.connect("mongodb+srv://justin:223217527@online-judge.bra5zco.mongodb.net/?retryWrites=true&w=majority&appName=online-judge", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ 成功連接 MongoDB"))
  .catch(err => console.error("❌ MongoDB 錯誤：", err));

// 測試 API
app.get("/api/hello", (req, res) => {
    res.send("👋 Hello from backend");
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 伺服器啟動中：http://localhost:${PORT}`);
});
