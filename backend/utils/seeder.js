// import mongoose from "mongoose";
// import dotenv from "dotenv";

// import connectDb from "../config/db.js";

// import School from "../models/school.model.js";
// import Branch from "../models/branch.model.js";
// import Student from "../models/student.model.js";
// import StudentStandard from "../models/studentStandard.model.js";
// import Result from "../models/result.model.js";

// dotenv.config();
// await connectDb();

// // clear db
// await School.deleteMany();
// await Branch.deleteMany();
// await Student.deleteMany();
// await StudentStandard.deleteMany();
// await Result.deleteMany();

// console.log("Old data cleared");

// // create school
// const schools = await School.insertMany([
//   { name: "New Noble School" },
//   { name: "Panchtirth School" },
//   { name: "Silver Oak School" },
// ]);

// const branchConfig = {
//   "New Noble School": ["Kathwada", "Naroda","ranip"],
//   "Panchtirth School": ["Nikol", "Bopal","odhav"],
//   "Silver Oak School": ["SG Highway", "Gota","sola"],
// };

// let allBranches = [];

// for (let school of schools) {
//   const branchNames = branchConfig[school.name];

//   const branches = await Branch.insertMany(
//     branchNames.map((name) => ({
//       name,
//       schoolId: school._id
//     }))
//   );

//   allBranches.push(...branches);
// }

// console.log("Schools & Branches created");

// //  CONFIG
// const TOTAL = 1800000; // 18 Lake
// const BATCH_SIZE = 10000;

// for (let i = 1; i <= TOTAL; i += BATCH_SIZE) {
//   let students = [];
//   let standards = [];
//   let results = [];

//   for (let j = 0; j < BATCH_SIZE && i + j <= TOTAL; j++) {
//     const globalIndex = i + j;

//     //  random school + branch
//     const school = schools[Math.floor(Math.random() * schools.length)];
//     const branchOptions = allBranches.filter(
//       b => b.schoolId.toString() === school._id.toString()
//     );
//     const branch = branchOptions[Math.floor(Math.random() * branchOptions.length)];

//     const studentId = new mongoose.Types.ObjectId();

//     // STUDENT
//     students.push({
//       _id: studentId,
//       name: `Student ${globalIndex}`,
//       schoolId: school._id,
//       branchId: branch._id
//     });

//     // STANDARD
//     const standard = Math.floor(Math.random() * 12) + 1;

//     standards.push({
//       studentId,
//       schoolId: school._id,
//       branchId: branch._id,
//       standard
//     });

//     // RESULT
//     results.push({
//       studentId,
//       branchId: branch._id,
//       standard,
//       marks: {
//         maths: Math.floor(Math.random() * 100),
//         science: Math.floor(Math.random() * 100),
//         english: Math.floor(Math.random() * 100)
//       }
//     });
//   }

//   await Student.insertMany(students, { ordered: false });
//   await StudentStandard.insertMany(standards, { ordered: false });
//   await Result.insertMany(results, { ordered: false });

//   console.log(`Inserted ${Math.min(i + BATCH_SIZE - 1, TOTAL)}`);
// }

// console.log(" Seeding completed");
// process.exit();

import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDB from "../config/db.js";

import School from "../models/school.model.js";
import Branch from "../models/branch.model.js";
import Student from "../models/student.model.js";
import StudentStandard from "../models/studentStandard.model.js";
import Result from "../models/result.model.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log("DB Connected");

    //  Drop DB (important for Atlas + clean run)
    await mongoose.connection.dropDatabase();
    console.log("Database dropped");

    //  1. CREATE SCHOOLS
    const schools = await School.insertMany([
      { name: "New Noble School" },
      { name: "Panchtirth School" },
      { name: "Silver Oak School" }
    ]);
    console.log("Schools inserted");

    //  2. DIFFERENT BRANCHES PER SCHOOL
   const branchConfig = {
  "New Noble School": ["Kathwada", "Naroda","ranip"],
  "Panchtirth School": ["Nikol", "Bopal","odhav"],
  "Silver Oak School": ["SG Highway", "Gota","sola"],
};

    const branchData = [];

    schools.forEach((school) => {
      const branchesForSchool = branchConfig[school.name];

      branchesForSchool.forEach((branch) => {
        branchData.push({
          name: branch,
          schoolId: school._id
        });
      });
    });

    const branches = await Branch.insertMany(branchData);
    console.log("Branches inserted");

    // OPTIMIZATION: branch map (O(1))
    const branchMap = {};
    branches.forEach((b) => {
      const key = b.schoolId.toString();
      if (!branchMap[key]) branchMap[key] = [];
      branchMap[key].push(b);
    });

    const TOTAL_STUDENTS = 1800000;   // use 1800000 for local DB only
    const BATCH_SIZE = 10000;

    const subjects = ["Maths", "Science", "English"];

    console.log("Seeding students...");

    for (let i = 0; i < TOTAL_STUDENTS; i += BATCH_SIZE) {
      const studentsBatch = [];

      //  STEP 1: Prepare students
      for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_STUDENTS; j++) {
        const school =
          schools[Math.floor(Math.random() * schools.length)];

        const schoolBranches = branchMap[school._id.toString()];
        const branch =
          schoolBranches[Math.floor(Math.random() * schoolBranches.length)];

        studentsBatch.push({
          name: `Student_${i + j}`,
          schoolId: school._id,
          branchId: branch._id
        });
      }

      //  STEP 2: Insert students
      const insertedStudents = await Student.insertMany(studentsBatch, {
        ordered: true // keep true for debugging
      });

      console.log(`Students inserted: ${insertedStudents.length}`);

      //  STEP 3: Prepare standards + results
      const standardsBatch = [];
      const resultsBatch = [];

      insertedStudents.forEach((student) => {
        const standard = Math.floor(Math.random() * 12) + 1;

        standardsBatch.push({
          studentId: student._id,
          schoolId: student.schoolId,   
          branchId: student.branchId,  
          standard
        });

        subjects.forEach((sub) => {
          resultsBatch.push({
            studentId: student._id,
            standard,
            subject: sub,
            marks: Math.floor(Math.random() * 100)
          });
        });
      });

      console.log(`Standards prepared: ${standardsBatch.length}`);

      const insertedStandards = await StudentStandard.insertMany(
        standardsBatch,
        { ordered: true }
      );

      console.log(`Standards inserted: ${insertedStandards.length}`);

      const insertedResults = await Result.insertMany(resultsBatch, {
        ordered: true
      });

      console.log(`Results inserted: ${insertedResults.length}`);

      console.log(` Batch completed: ${i + BATCH_SIZE}`);
    }

    console.log(" Data seeding completed successfully");
    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

seedData();