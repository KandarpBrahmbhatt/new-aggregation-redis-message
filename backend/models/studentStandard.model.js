// models/studentStandard.model.js
import mongoose from "mongoose";

const studentStandardSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    },
    standard: {
        type: Number,
        required: true
    }
}, { timestamps: true });

studentStandardSchema.index({
    schoolId: 1,
    branchId: 1,
    standard: 1
});

export default mongoose.model("StudentStandard", studentStandardSchema);