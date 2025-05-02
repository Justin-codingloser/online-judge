const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("../routes/auth");
const problemRoutes = require("../routes/problem");
const submitRoutes = require("../routes/submit");
const submissionRoutes = require("../routes/submission");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000; // 🚀 支援 Render 的自動 PORT

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submit", submitRoutes);
app.use("/api/submissions", submissionRoutes);
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ MongoDB 連接（改為讀取環境變數）
const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL, {
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
