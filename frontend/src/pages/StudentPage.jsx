  // // import React from "react";

  // // const StudentPage = () => {
  // //     const onButtonClick = () => {
  // //         const pdfUrl = "Sample.pdf";
  // //         const link = document.createElement("a");
  // //         link.href = pdfUrl;
  // //         link.download = "your profile";
  // //         document.body.appendChild(link);
  // //         link.click();
  // //         document.body.removeChild(link);
  // //     };
  // //     return (
  // //         <>
  // //             <center>
  // //                 <h1>Welcome to Your Profile</h1>
  // //                 <h3>
  // //                     Click on below button to download PDF
  // //                     file
  // //                 </h3>
  // //                 <button onClick={onButtonClick}>
  // //                     Download PDF
  // //                 </button>
  // //             </center>


  // //             <table>
  // //               <thead>
  // //                 <tr>
  // //                   <td>studentName</td>
  // //                   <td>marks</td>
  // //                   <td>branch</td>
  // //                   <td>total</td>
  // //                 </tr>
  // //               </thead>

  // //               <tbody>
  // //                 <tr>
  // //                   <td>kyb</td>
  // //                   <td>1546</td>
  // //                   <td></td>
  // //                 </tr>
  // //               </tbody>
  // //             </table>
  // //         </>
  // //     );
  // // };

  // // export default StudentPage;

  // import { useEffect, useState } from "react";
  // import { fetchStudents } from "../api/api";
  // import { useSearchParams, useNavigate } from "react-router-dom";
  // import Loader from "../components/Loadar";

  // const StudentPage = () => {
  //   const [data, setData] = useState([]);
  //   const [loading, setLoading] = useState(true);
  //   const[message,setmessage] = useState("")
  //   const [params] = useSearchParams();
  //   const schoolName = params.get("schoolName");
  //   const branchName = params.get("branchName");
  //   const standard = params.get("standard");

  //   const navigate = useNavigate();

  //   const loadData = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetchStudents();
  //       setData(res.data.data || []);
  //       setmessage(`${res.data.source}`)
  //     } catch (err) {
  //       console.error(err);
  //       setData([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   useEffect(() => {
  //     if (schoolName && branchName && standard) {
  //       loadData();
  //     }
  //   }, [schoolName, branchName, standard]);

  //   //  Get all unique subjects (important fix)
  //   const allSubjects = [
  //     ...new Set(
  //       data.flatMap((s) => s.subjects?.map((sub) => sub.subject) || [])
  //     ),
  //   ];

  //   return (
  //     <div className="container">
  //       <button onClick={() => navigate(-1)}>Back</button>

  //       <h2>
  //         {schoolName} | {branchName} | Class {standard}
  //       </h2>

  //       {loading ? (
  //         <Loader />
  //       ) : data.length === 0 ? (
  //         <p style={{ color: "red" }}>No students found</p>
  //       ) : (
          

  //         <div className="table-wrapper">
  //          <p style={{ textAlign: "center", color: "red" }}>
  //               Data come from {message}
  //             </p>
  //           <table className="table">
  //             <thead>
  //               <tr>
  //                 <th>NO</th>
  //                 <th>Student Name</th>
  //                 <th>Branch</th>
  //                 <th>Class</th>

  //                 {/* Dynamic Subjects */}
  //                 {allSubjects.map((subject, i) => (
  //                   <th key={i}>{subject}</th>
  //                 ))}

  //                 <th>Total</th>
  //               </tr>
  //             </thead>

  //             <tbody>
  //               {data.map((student, index) => (
  //                 <tr key={index}>
  //                   <td>{index + 1}</td>
  //                   <td onClick={()=>navigate("/student")}>{student.studentName}</td>
  //                   <td>{student.branch}</td>
  //                   <td>{student.class}</td>

  //                   {/* Marks */}
  //                   {allSubjects.map((subject, i) => {
  //                     const found = student.subjects?.find(
  //                       (s) => s.subject === subject
  //                     );
  //                     return <td key={i}>{found ? found.marks : "-"}</td>;
  //                   })}

  //                   <td>
  //                     <b>{student.totalMarks}</b>
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  // export default StudentPage;
