// // models/result.model.js
// import mongoose from "mongoose";

// const resultSchema = new mongoose.Schema({
//     studentId: mongoose.Schema.Types.ObjectId,
//     standard: Number,
//     subject: String,a
//     marks: Number
// });

// export default mongoose.model("Result", resultSchema);


import mongoose from 'mongoose'

const resultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        index: true
    },
    // standard: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "StudentStandard",
    //       index: true
    // },
    standard: {
        type: Number,
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        index: true
    },
    // subject: {
    //     type: String,
    //       index: true
    // },
    // marks: {
    //     type: Number
    // }


    marks: {
      maths: { type: Number, required: true },
      science: { type: Number, required: true },
      english: { type: Number, required: true },
    },
}, {
    timestamps: true
})

resultSchema.index({ studentId: 1, branchId: 1 });
const Result = mongoose.model("Result", resultSchema)

export default Result