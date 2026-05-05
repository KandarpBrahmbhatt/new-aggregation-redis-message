import School from "../models/school.model.js"
import Branch from "../models/branch.model.js"
import resultModel from "../models/result.model.js"
import redis from "../config/redis.js";

// export const getSchoolListing = async (req, resp) => {
//   try {

//     const data = await School.aggregate([
//       // join branches
//       {
//         $lookup: {
//           from: "branches", // the foreignField collection to join with
//           localField: "_id", // the field from current school collection
//           foreignField: "schoolId", // the field in the "branches" collection
//           as: "branches"
//         }
//       },

//       {
//         $lookup: {
//           from: "studentstandards",
//           localField: "_id",
//           foreignField: "schoolId",
//           as: "students"
//         }
//       },

//       {
//         $unwind: {
//           path: "$students",
//           preserveNullAndEmptyArrays: true
//         }
//       },

//       // group by school + standard

//       {
//         $group: {
//           _id: {
//             schoolId: "$_id",
//             schoolName: "$name",
//             standard: "$students.standard"
//           },
//           branchcount: { $first: { $size: "$branches" } },
//           totalStudents: { $sum: 1 }
//         }
//       },

//       // group again by school

//       {
//         $group: {
//           _id: {
//             schoolId: "$_id.schoolId",
//             schoolName: "$_id.schoolName",
//           },
//           branchcount: { $first: "$branchCount" },
//           standards: {
//             $push: {
//               standard: "$_id.standard",
//               totalStudents: "$totalStudents"
//             }
//           }
//         }
//       },

//       {
//         $project: {
//           _id: 0,
//           schoolName: "$_id.schoolName",
//           branchCount: 1,           
//           standard: 1
//         }
//       }
//     ])

//     const total = await School.countDocuments()
//             const results = {
//                 data,
//                 total
//             }
//     return resp.status(200).json({ message: "gettingSchoolListing successfully", ...results })
//   } catch (error) {
//     console.log(error)
//     return resp.status(400).json({ message: "gettingSchoolListing error", error })
//   }
// }

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
export const branchWiseListing = async (req, resp) => {
  try {
    const { schoolName } = req.query

    let query = {};

    if (schoolName) {
      query.schoolName = { $regex: schoolName, $options: "i" };
    }

    const data = await Branch.aggregate([
      {
        $lookup: {
          from: "schools",
          localField: "schoolId",
          foreignField: "_id",
          as: "schools"
        }
      },
      { $unwind: "$school" },

      // ...(schoolName?[
      //   {
      //     $match:{
      //       "school.name":schoolName
      //     }
      //   }
      // ]:[]),

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
    ])

    return resp.status(200).json({ message: "branchwiseListing successfully", data })
  } catch (error) {
    console.log(error)
    return resp.status(500).json({ message: "branchwiseListing error", error })
  }
}


export const markswiseListing = async (req, resp) => {
  try {
    const { schoolName, branchName, standard } = req.query
    console.log(req.query)
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit;
    let query = {};
    console.log(query)
    if (schoolName) {
      query.schoolName = { $regex: schoolName, $options: "i" }
      console.log(schoolName)
    }

    if (branchName) {
      query.branchName = {
        
      }
      console.log(branchName)
    }

    if (standard) {
      query.standard = { $regex: standard, $options: "i" }
      console.log(standard)
    }
    const data = await resultModel.aggregate([
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
          as: "schools"
        }
      },
      { $unwind: "$school" },

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
    ])
    console.log(data)
    return resp.status(200).json({ message: "MarksWiseFiltering Sucessfully", data, page, limit })
  } catch (error) {
    console.log(error)
    return resp.status(500).json({ message: "markswise filtering error", error })
  }
}