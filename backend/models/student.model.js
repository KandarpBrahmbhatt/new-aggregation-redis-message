// models/student.model.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: String,
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    }
}, { timestamps: true });

//  INDEXES
studentSchema.index({ schoolId: 1 });
studentSchema.index({ branchId: 1 });

// COMPOUND INDEX (very important)
studentSchema.index({ schoolId: 1, branchId: 1 });

export default mongoose.model("Student", studentSchema);