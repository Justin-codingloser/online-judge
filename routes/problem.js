const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");

router.post("/create", async (req, res) => {
    const {
        title, description, input, output,
        sampleInput, sampleOutput, testcases, createdBy
    } = req.body;

    try {
        const problem = new Problem({
            title,
            description,
            input,
            output,
            sampleInput,
            sampleOutput,
            testcases,
            createdBy
        });
        await problem.save();
        res.send("題目新增成功");
    } catch (err) {
        console.error(err);
        res.status(500).send("題目新增失敗");
    }
});

router.get("/list", async (req, res) => {
    const problems = await Problem.find({}, "title _id");
    res.json(problems);
});

router.get("/:id", async (req, res) => {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).send("題目不存在");
    res.json(problem);
});

router.delete("/:id", async (req, res) => {
    try {
        await Problem.findByIdAndDelete(req.params.id);
        res.send("題目已刪除");
    } catch (err) {
        res.status(500).send("無法刪除題目");
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updated = await Problem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).send("修改失敗");
    }
});



module.exports = router;
