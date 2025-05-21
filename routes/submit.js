const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// POST /api/submit/:problemId
router.post("/:problemId", async (req, res) => {
    const { code, language } = req.body; // 取得語言
    const { problemId } = req.params;

    // 只允許 python 和 cpp
    if (!["python", "cpp"].includes(language)) {
        return res.status(400).json({ error: "只允許提交 Python 或 C++ 程式碼" });
    }

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ error: "題目不存在" });

        let results = [];
        let passedAll = true;

        for (const testcase of problem.testcases) {
            const input = testcase.input;
            const expectedOutput = testcase.output.trim();

            // 根據語言決定副檔名與執行指令
            let filename, filepath, run, compileProcess;
            if (language === "python") {
                filename = `code_${uuidv4()}.py`;
                filepath = path.join(__dirname, "..", "submissions", filename);
                fs.writeFileSync(filepath, code);
                run = spawn("python", [filepath]);
            } else if (language === "cpp") {
                filename = `code_${uuidv4()}.cpp`;
                filepath = path.join(__dirname, "..", "submissions", filename);
                fs.writeFileSync(filepath, code);
                // 編譯
                const exePath = filepath.replace(".cpp", ".exe");
                compileProcess = spawn("g++", [filepath, "-o", exePath]);
                await new Promise((resolve, reject) => {
                    compileProcess.on("close", (code) => {
                        if (code !== 0) reject("C++ 編譯失敗");
                        else resolve();
                    });
                });
                run = spawn(exePath);
            }

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

            // 刪除暫存檔案
            fs.unlinkSync(filepath);
            if (language === "cpp") {
                const exePath = filepath.replace(".cpp", ".exe");
                if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
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
