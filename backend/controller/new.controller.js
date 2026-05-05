import School from "../models/school.model.js";
import mongoose from "mongoose";
import Branch from "../models/branch.model.js";
import StudentStandard from "../models/studentStandard.model.js";
import Result from "../models/result.model.js";
import redis from "../config/redis.js";
import schoolModel from "../models/school.model.js";

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

            // 4. GROUP BY SCHOOL + STANDARD
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

            // 5.group again by school
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

            // 6. formate
            {
                $project: {
                    _id: 0,
                    schoolName: "$_id.schoolName",
                    branchCount: 1,
                    standards: 1
                }
            }

        ]);

        const total = await schoolModel.countDocuments()
        const results = {
            data,
            total
        }
        await redis.set(cacheKey, JSON.stringify(results))
        return res.status(200).json({ message: "gettingSchoolisting is Successfully", ...results })
        // res.json(data);
    } catch (err) {
        console.error(err);
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

        const total = await Branch.countDocuments();

        const results = {
            total,
            data
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


// export const getStudentsWithMarks = async (req, res) => {
//   try {
//     const { schoolName, branchName, standard } = req.query;

//     let page = parseInt(req.query.page) || 1;
//     let limit = parseInt(req.query.limit) || 10;

//     const skip = (page - 1) * limit;

//     const pipeline = [
//       // 1. LOOKUP STUDENT
//       {
//         $lookup: {
//           from: "students",
//           localField: "studentId",
//           foreignField: "_id",
//           as: "student"
//         }
//       },
//       {
//         $addFields: {
//           student: { $arrayElemAt: ["$student", 0] }
//         }
//       },

//       // 2. LOOKUP BRANCH
//       {
//         $lookup: {
//           from: "branches",
//           localField: "branchId",
//           foreignField: "_id",
//           as: "branch"
//         }
//       },
//       {
//         $addFields: {
//           branch: { $arrayElemAt: ["$branch", 0] }
//         }
//       },

//       // 3. LOOKUP SCHOOL
//       {
//         $lookup: {
//           from: "schools",
//           localField: "student.schoolId",
//           foreignField: "_id",
//           as: "school"
//         }
//       },
//       {
//         $addFields: {
//           school: { $arrayElemAt: ["$school", 0] }
//         }
//       },

//       // 4. FILTER
//       {
//         $match: {
//           ...(schoolName && {
//             "school.name": { $regex: schoolName, $options: "i" }
//           }),
//           ...(branchName && {
//             "branch.name": { $regex: branchName, $options: "i" }
//           }),
//           ...(standard && {
//             standard: Number(standard)
//           })
//         }
//       },

//       // 5. PROJECT
//       {
//         $project: {
//           _id: 0,
//           studentName: "$student.name",
//           marks: 1,
//           branch: "$branch.name",
//           school: "$school.name",
//           class: { $concat: ["Class ", { $toString: "$standard" }] }
//         }
//       },

//       // 6. PAGINATION (IMPORTANT)
//       {
//         $skip: skip
//       },
//       {
//         $limit: limit
//       }
//     ];

//     const data = await Result.aggregate(pipeline);

//     res.json({
//       success: true,
//       page,
//       limit,
//       // count: data.length,
//       data
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "Error",
//       error: err.message
//     });
//   }
// };



export const getStudentsWithMarks = async (req, res) => {
    try {
        const { schoolName, branchName, standard } = req.query;
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

         const skip = (page - 1) * limit;
        const cacheKey = `getStudentsWithMarks:${schoolName}:${branchName}:${standard}`;
        const catched = await redis.get(cacheKey)

        
        if(catched){
            console.log("catch HIT")
            return res.status(200).json({source:"redis",...JSON.parse(catched)})
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
                    ...(standard && { standard: Number(standard) })
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


        const total = await Result.countDocuments();

        const results = {
            total,
            data,
            page,
            limit,
            skip,
        }

        await redis.set(cacheKey, JSON.stringify(results))

        res.json({ success: true, count: data.length, source:"database",...results });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};