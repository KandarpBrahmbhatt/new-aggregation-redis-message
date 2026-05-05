// models/student.model.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: {
        type:String,
        index:true,
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
    }
}, { timestamps: true });

studentSchema.index({ schoolId: 1, branchId: 1 });

export default mongoose.model("Student", studentSchema);