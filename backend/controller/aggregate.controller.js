import mongoose from "mongoose";
import studentStandardModel from "../models/studentStandard.model.js";

const buildClassArray = (classMap) => {
  const out = [];
  for (let standard = 1; standard <= 12; standard += 1) {
    out.push({
      class: `Class ${standard}`,
      students: classMap.get(standard) || 0
    });
  }
  return out;
};

export const getAggregatedListing = async (req, res) => {
  try {
    const view = (req.query.view || "school").toLowerCase();
    const schoolName = req.query.schoolName?.trim();

    if (!["school", "branch"].includes(view)) {
      return res.status(400).json({
        success: false,
        message: "Invalid view. Use view=school or view=branch."
      });
    }

    const pipeline = [
      {
        $lookup: {
          from: "schools",
          localField: "schoolId",
          foreignField: "_id",
          as: "school"
        }
      },
      { $set: { school: { $arrayElemAt: ["$school", 0] } } }
    ];

    if (schoolName) {
      pipeline.push({
        $match: {
          "school.name": { $regex: schoolName, $options: "i" }
        }
      });
    }

    if (view === "branch") {
      pipeline.push(
        {
          $lookup: {
            from: "branches",
            localField: "branchId",
            foreignField: "_id",
            as: "branch"
          }
        },
        { $set: { branch: { $arrayElemAt: ["$branch", 0] } } }
      );
    }

    pipeline.push({
      $group: {
        _id: {
          schoolId: "$schoolId",
          schoolName: "$school.name",
          standard: "$standard",
          ...(view === "branch"
            ? { branchId: "$branchId", branchName: "$branch.name" }
            : {})
        },
        totalStudents: { $sum: 1 }
      }
    });

    pipeline.push({
      $sort: { "_id.standard": 1 }
    });

    const grouped = await studentStandardModel.aggregate(pipeline);

    if (view === "school") {
      const schoolMap = new Map();

      grouped.forEach((row) => {
        const id = String(row._id.schoolId);
        if (!schoolMap.has(id)) {
          schoolMap.set(id, {
            schoolId: id,
            schoolName: row._id.schoolName,
            classMap: new Map()
          });
        }
        schoolMap.get(id).classMap.set(row._id.standard, row.totalStudents);
      });

      const schools = await mongoose.connection.collection("branches").aggregate([
        { $group: { _id: "$schoolId", branchCount: { $sum: 1 } } }
      ]).toArray();
      const branchCountMap = new Map(
        schools.map((x) => [String(x._id), x.branchCount])
      );

      const data = Array.from(schoolMap.values()).map((item) => ({
        schoolId: item.schoolId,
        schoolName: item.schoolName,
        branchCount: branchCountMap.get(item.schoolId) || 0,
        classes: buildClassArray(item.classMap)
      }));

      return res.json({
        success: true,
        view: "school",
        count: data.length,
        data
      });
    }

    const branchMap = new Map();
    grouped.forEach((row) => {
      const id = String(row._id.branchId);
      if (!branchMap.has(id)) {
        branchMap.set(id, {
          branchId: id,
          branchName: row._id.branchName,
          schoolName: row._id.schoolName,
          classMap: new Map()
        });
      }
      branchMap.get(id).classMap.set(row._id.standard, row.totalStudents);
    });

    const data = Array.from(branchMap.values()).map((item) => ({
      branchId: item.branchId,
      branchName: item.branchName,
      schoolName: item.schoolName,
      classes: buildClassArray(item.classMap)
    }));

    return res.json({
      success: true,
      view: "branch",
      count: data.length,
      data
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch listing data",
      error: error.message
    });
  }
};
