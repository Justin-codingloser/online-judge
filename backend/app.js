const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("../routes/auth");
const problemRoutes = require("../routes/problem");
const submitRoutes = require("../routes/submit");
const submissionRoutes = require("../routes/submission");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submit", submitRoutes);
app.use("/api/submissions", submissionRoutes);

// ✅ MongoDB 連接（改為讀取環境變數）
const mongoURL = process.env.MONGO_URL; // 確保環境變數中包含完整的 MongoDB 連接字串
if (!mongoURL) {
    console.error("❌ 環境變數 MONGO_URL 未設定");
    process.exit(1); // 終止程式
}

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ 成功連接 MongoDB"))
  .catch(err => console.error("❌ MongoDB 錯誤：", err));

// 測試 API
app.get("/api/hello", (req, res) => {
    res.send("👋 Hello from backend");
});

app.get("/", (req, res) => {
    res.redirect("/login.html");
  });

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 伺服器啟動中：http://localhost:${PORT}`);
});
