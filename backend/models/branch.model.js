// models/branch.model.js
import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
    name: String,
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true
    }
});


branchSchema.index({ schoolId: 1,name:1 });

export default mongoose.model("Branch", branchSchema);