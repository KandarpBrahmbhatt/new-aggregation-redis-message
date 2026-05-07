import School from "../models/school.model.js";
import mongoose from "mongoose";
import Branch from "../models/branch.model.js";
import StudentStandard from "../models/studentStandard.model.js";
import Result from "../models/result.model.js";
import redis from "../config/redis.js";
import schoolModel from "../models/school.model.js";
import Student from "../models/student.model.js";

// pdf gernate karava mae librery use kareli 6e.
import PDFDocument from 'pdfkit';
import fs from 'fs'
import { decryptData, encryptData } from "../utils/AES.js";

export const getSchoolListing = async (req, res) => {
    try {
        const cacheKey = `getSchoolListing`
        const cached = await redis.get(cacheKey)
        if (cached) {
            console.log("Cache Hit")
            return res.status(200).json({ source: "redis", ...JSON.parse(cached) })
        }
        console.log("Cached Miss")

        const data = await School.aggregate([

            //  join branches
            {
                $lookup: {
                    from: "branches",
                    localField: "_id",
                    foreignField: "schoolId",
                    as: "branches"
                }
            },

            // join student standard
            {
                $lookup: {
                    from: "studentstandards",
                    localField: "_id",
                    foreignField: "schoolId",
                    as: "students"
                }
            },

            // 3. unwind students
            {
                $unwind: {
                    path: "$students",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $group: {
                    _id: {
                        schoolId: "$_id",
                        schoolName: "$name",
                        standard: "$students.standard"
                    },
                    branchCount: { $first: { $size: "$branches" } },
                    totalStudents: { $sum: 1 }
                }
            },

            {
                $group: {
                    _id: {
                        schoolId: "$_id.schoolId",
                        schoolName: "$_id.schoolName"
                    },
                    branchCount: { $first: "$branchCount" },
                    standards: {
                        $push: {
                            standard: "$_id.standard",
                            totalStudents: "$totalStudents"
                        }
                    }
                }
            },

            {
                $project: {
                    _id: 0,
                    schoolName: "$_id.schoolName",
                    branchCount: 1,
                    standards: 1
                }
            }

        ]);

        const encrypted = encryptData(data)
        const decrypted = decryptData(encrypted)

        const total = await schoolModel.countDocuments()
        const results = {
            data,
            total,
            encrypted,
            decrypted
        }
        console.log(results)
        await redis.set(cacheKey, JSON.stringify(results), "EX", "60")
        // await redis.set(cacheKey, JSON.stringify(results)) 
        return res.status(200).json({ message: "gettingSchoolisting is Successfully", ...results })
        // res.json(data);

    } catch (err) {
        console.error(err);
        // return res.status(500).json({message:"gettingSchoolisting error",error:err.message})
        res.status(500).json({ error: err.message });
    }
};

export const getBranchWiseData = async (req, res) => {
    try {
        const { schoolName } = req.query;

        const cacheKey = `getbranchlisting:${schoolName}`
        const cached = await redis.get(cacheKey)
        if (cached) {
            return res.status(200).json({ source: "redis", ...JSON.parse(cached) })
        }
        console.log("cached MISS")

        const data = await Branch.aggregate([
            // Join School collection
            {
                $lookup: {
                    from: "schools",
                    localField: "schoolId",
                    foreignField: "_id",
                    as: "school"
                }
            },
            { $unwind: "$school" },

            // Filter by schoolName
            ...(schoolName
                ? [{
                    $match: {
                        "school.name": schoolName
                    }
                }]
                : []),

            //  Join StudentStandard
            {
                $lookup: {
                    from: "studentstandards",
                    let: { branchId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$branchId", "$$branchId"]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$standard",
                                totalStudents: { $sum: 1 }
                            }
                        },
                        {
                            $sort: { _id: 1 } // sort classes 1 → 12
                        }
                    ],
                    as: "classStats"
                }
            },

            // Format output
            {
                $project: {
                    _id: 0,
                    branchId: "$_id",
                    branchName: "$name",
                    schoolName: "$school.name",
                    classStats: {
                        $map: {
                            input: "$classStats",
                            as: "c",
                            in: {
                                standard: "$$c._id",
                                totalStudents: "$$c.totalStudents"
                            }
                        }
                    }
                }
            }
        ]);

        const encrypted = encryptData(data)

        await Crypto.create({ encrypted }) // store encrypted data in mongodb 
        const total = await Branch.countDocuments();

        const results = {
            total,
            data,
            encrypted
        }

        await redis.set(cacheKey, JSON.stringify(results))

        return res.status(200).json({ message: "getBranchWiseData successfully", source: "DataBase", ...results })
        // res.json({
        //     success: true,
        //     totalBranches: data.length,
        //     data
        // });

    } catch (error) {
        console.error("Branch Stats Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


export const getStudentsWithMarks = async (req, res) => {
    try {
        const { schoolName, branchName, standard, studentName } = req.query;
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const skip = (page - 1) * limit;
        const cacheKey = `getStudentsWithMarks:${schoolName}:${branchName}:${standard}`;
        const catched = await redis.get(cacheKey)


        if (catched) {
            console.log("catch HIT")
            return res.status(200).json({ source: "redis", ...JSON.parse(catched) })
        }
        console.log("catch miss")

        const data = await Result.aggregate([

            // student
            {
                $lookup: {
                    from: "students",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "student"
                }
            },
            { $unwind: "$student" },

            // branch
            {
                $lookup: {
                    from: "branches",
                    localField: "student.branchId",
                    foreignField: "_id",
                    as: "branch"
                }
            },
            { $unwind: "$branch" },

            // school
            {
                $lookup: {
                    from: "schools",
                    localField: "student.schoolId",
                    foreignField: "_id",
                    as: "school"
                }
            },
            { $unwind: "$school" },

            // filters
            {

                $match: {
                    ...(schoolName && {
                        "school.name": { $regex: schoolName, $options: "i" }
                    }),
                    ...(branchName && {
                        "branch.name": { $regex: branchName, $options: "i" }
                    }),
                    ...(standard && { standard: Number(standard) }),

                    // PDF MATE AND UPER STUDENT NAME PASS KAREL 6E QUERY MA
                    ...(studentName && {
                        "student.name": { $regex: studentName, $options: "i" }
                    })
                }
            },

            {
                $group: {
                    _id: "$studentId",
                    studentName: { $first: "$student.name" },
                    class: { $first: "$standard" },
                    branch: { $first: "$branch.name" },
                    school: { $first: "$school.name" },

                    subjects: {
                        $push: {
                            subject: "$subject",
                            marks: "$marks"
                        }
                    },

                    totalMarks: { $sum: "$marks" }
                }
            },

            {
                $project: {
                    _id: 0,
                    studentId: "$_id",
                    studentName: 1,
                    class: { $concat: ["Class ", { $toString: "$class" }] },
                    branch: 1,
                    school: 1,
                    subjects: 1,
                    totalMarks: 1
                }
            },

            {
                $skip: skip
            },
            {
                $limit: limit
            },
            // { $limit: 100 }

        ]);

        // const encryptedData = Result.map((user)=>(
        //     ...user,
        //     schoolName:user.schoolName          ,
        //     standard:user.standard,
        // ))

        const encrypted = encryptData(data)
        const decrypted = decryptData(encrypted)

        console.log(`encrypted data : ${encrypted}`)
        console.log(`decrepted data : ${decrypted}`)

        const total = await Result.countDocuments();

        const results = {
            encrypted,
            decrypted,
            total,
            data,
            page,
            limit,
            skip,
        }

        await redis.set(cacheKey, JSON.stringify(results), "EX", 60)

        res.json({ success: true, count: data.length, source: "database", ...results });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// export const singleStudent = async (req, resp) => {
//     try {
//         const { id } = req.params;
//         console.log(req.params)
//         const student = await Student.findById(id)
//         console.log(student)
//         resp.status(200).json({ message: "getting singleStudent suceessfully", student })

//     } catch (error) {
//         console.log(error)
//         resp.status(200).json({ message: "gettinf singleStudent Error", message: error.message })
//     }
// }

export const downloadStudentPDF = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid student id");
        }

        const [studentReport] = await Result.aggregate([
            {
                $match: {
                    studentId: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "studentId",
                    foreignField: "_id",
                    as: "student"
                }
            },
            { $unwind: "$student" },
            {
                $lookup: {
                    from: "branches",
                    localField: "student.branchId",
                    foreignField: "_id",
                    as: "branch"
                }
            },
            { $unwind: "$branch" },
            {
                $lookup: {
                    from: "schools",
                    localField: "student.schoolId",
                    foreignField: "_id",
                    as: "school"
                }
            },
            { $unwind: "$school" },
            {
                $group: {
                    _id: "$studentId",
                    studentName: { $first: "$student.name" },
                    school: { $first: "$school.name" },
                    branch: { $first: "$branch.name" },
                    standard: { $first: "$standard" },
                    subjects: {
                        $push: {
                            subject: "$subject",
                            marks: "$marks"
                        }
                    },
                    totalMarks: { $sum: "$marks" }
                }
            }
        ]);

        if (!studentReport) {
            return res.status(404).send("Student result not found");
        }

        //pdf download pfg kit

        const fileName = `${studentReport.studentName || "Student"}_Report.pdf`.replace(/[^\w.-]/g, "_");
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        doc.pipe(res);

        doc
            .fontSize(22)
            .fillColor('#4cafef')
            .text('Student Report Card', { align: 'center' });

        doc
            .moveDown(0.4)
            .fontSize(10)
            .fillColor('black')
            .text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });

        doc
            .moveDown(1.5)
            .fillColor('black')
            .fontSize(14)
            .text('Student Information');

        doc.moveDown(0.7);
        doc.fontSize(12);
        doc.text(`Name: ${studentReport.studentName}`);
        doc.text(`School: ${studentReport.school}`);
        doc.text(`Branch: ${studentReport.branch}`);
        doc.text(`Class: Class ${studentReport.standard}`);

        doc
            .moveDown(1.5)
            .fontSize(14)
            .text('Subject Wise Marks');

        doc.moveDown();

        const tableTop = doc.y;
        const subjectX = 70;
        const marksX = 400;
        const rowHeight = 26;
        let y = tableTop;

        doc
            .fontSize(12)
            .rect(60, y - 6, 470, rowHeight)
            .fillAndStroke('#4cafef', 'white')
            .fillColor('black')
            .text('Subject', subjectX, y)
            .text('Marks', marksX, y);

        y += rowHeight;

        studentReport.subjects.forEach((sub) => {
            doc
                .font('Helvetica')
                .rect(60, y - 6, 470, rowHeight)
                .stroke('#dddddd')
                .text(sub.subject, subjectX, y)
                .text(String(sub.marks), marksX, y);

            y += rowHeight;
        });

        doc
            .rect(60, y - 6, 470, rowHeight)
            .fillAndStroke('#f7f7f7', '#cccccc')
            .fillColor('#000000')
            .text('Total Marks', subjectX, y)
            .text(String(studentReport.totalMarks), marksX, y);

        doc.end();
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ message: "downloadStudenPDF error", error: error.message });
    }
};
