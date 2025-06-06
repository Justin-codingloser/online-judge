const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");

router.get("/:userId", async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.params.userId }).sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: "查詢失敗" });
    }
});

module.exports = router;
