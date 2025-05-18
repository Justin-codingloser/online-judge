const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 註冊
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).send("⚠️ 帳號已存在");

        const user = new User({ username, password });
        await user.save();
        res.send("✅ 註冊成功");
    } catch (err) {
        res.status(500).send("❌ 註冊錯誤");
    }
});

// 登入
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).send("❌ 帳號或密碼錯誤");
        }
        res.json({
            success: true,
            message: "✅ 登入成功（模擬 token）",
            token: "mock-token", // 如果你未來要加 JWT，可以放這裡
            username: user.username, // 回傳 username
            isadmin: user.isAdmin // 回傳 isAdmin
        });
    } catch (err) {
        res.status(500).send("❌ 登入錯誤");
    }
});

module.exports = router;
