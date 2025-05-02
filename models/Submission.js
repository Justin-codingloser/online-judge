const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: String,
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
    problemTitle: String,
    code: String,
    passedAll: Boolean,
    resultDetail: Array,
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Submission", SubmissionSchema);
