const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

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

            const filename = `code_${uuidv4()}.cpp`;
            const filepath = path.join(__dirname, "..", "submissions", filename);
            fs.writeFileSync(filepath, code);

            const exePath = filepath.replace(".cpp", ".exe");
            const compileProcess = spawn("g++", [filepath, "-o", exePath]);
            await new Promise((resolve, reject) => {
                compileProcess.on("close", (code) => {
                    if (code !== 0) reject("C++ 編譯失敗");
                    else resolve();
                });
            });

            const run = spawn(exePath);

            run.stdin.write(input);
            run.stdin.end();

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

            fs.unlinkSync(filepath);
            if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
        }

        const Submission = require("../models/Submission");

        const username = req.body.username || "unknown";
        const userId = req.body.userId || null;

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