const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// POST /api/submit/:problemId
router.post("/:problemId", async (req, res) => {
    const { code } = req.body;
    const { problemId } = req.params;

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: "題目不存在" });

        let results = [];
        let passedAll = true;

        for (const testcase of problem.testcases) {
            const input = testcase.input;
            const expectedOutput = testcase.output.trim();

            const filename = `code_${uuidv4()}.js`;
            const filepath = path.join(__dirname, "..", "submissions", filename);

            // 使用者程式碼會寫在 process.stdin 裡面
            const fullCode = code; // 直接寫入使用者 code

            fs.writeFileSync(filepath, fullCode);

            // 用 spawn 執行程式，能取得 stdin 和 stdout
            const run = spawn("node", [filepath]);

            // 將測資 input 寫入 stdin
            run.stdin.write(input);
            run.stdin.end();

            // 接收程式輸出
            const output = await new Promise((resolve, reject) => {
                let result = "";
                let error = "";

                run.stdout.on("data", (data) => {
                    result += data;
                });

                run.stderr.on("data", (err) => {
                    error += err;
                });

                run.on("close", () => {
                    if (error) {
                        reject("執行錯誤：" + error);
                    } else {
                        resolve(result.trim());
                    }
                });
            });

            const passed = output === expectedOutput;
            if (!passed) passedAll = false;

            results.push({
                input,
                expectedOutput,
                userOutput: output,
                passed
            });

            fs.unlinkSync(filepath); // 移除暫存的程式碼檔案
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
