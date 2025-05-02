const mongoose = require("mongoose");

const ProblemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    input: String,
    output: String,
    sampleInput: String,
    sampleOutput: String,
    testcases: [
        {
            input: String,
            output: String
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("Problem", ProblemSchema);
