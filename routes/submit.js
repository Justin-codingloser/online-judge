const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// POST /api/submit/:problemId
router.post("/:problemId", async (req, res) => {
    const { code } = req.body; // 只需要程式碼
    const { problemId } = req.params;

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: "題目不存在" });

        let results = [];
        let passedAll = true;

        for (const testcase of problem.testcases) {
            const input = testcase.input;
            const expectedOutput = testcase.output.trim();

            // 將程式碼與測資寫入檔案
            const codePath = path.join(__dirname, "..", "submissions", "code.cpp");
            const inputPath = path.join(__dirname, "..", "submissions", "input.txt");
            fs.writeFileSync(codePath, code);
            console.log("Code written to:", codePath);

            fs.writeFileSync(inputPath, input);
            console.log("Input written to:", inputPath);

            // 使用 Docker 執行程式碼
            const dockerCommand = `
                docker run --rm -v ${path.join(__dirname, "..", "submissions")}:/app online-judge /bin/bash -c "cd /app && ./run_code.sh"
            `;
            try {
                execSync(dockerCommand);
                const output = fs.readFileSync(path.join(__dirname, "..", "submissions", "output.txt"), "utf-8").trim();

                const passed = output === expectedOutput;
                if (!passed) passedAll = false;

                results.push({
                    input,
                    expectedOutput,
                    userOutput: output,
                    passed
                });
            } catch (err) {
                console.error("Docker 執行失敗：", err);
                passedAll = false;
                results.push({
                    input,
                    expectedOutput,
                    userOutput: null,
                    passed: false
                });
            }
        }

        const Submission = require("../models/Submission");

        // 取得使用者資訊（從前端傳入）
        const username = req.body.username || "unknown";
        const userId = req.body.userId || null;

        // 儲存紀錄
        await Submission.create({
            userId,
            username,
            problemId,
            problemTitle: problem.title,
            code,
            passedAll,
            resultDetail: results
        });

        res.json({
            passedAll,
            results
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "提交時出錯" });
    }
});

module.exports = router;
