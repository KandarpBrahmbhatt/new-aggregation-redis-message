// models/school.model.js
import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

schoolSchema.index({ name: 1 });

export default mongoose.model("School", schoolSchema);