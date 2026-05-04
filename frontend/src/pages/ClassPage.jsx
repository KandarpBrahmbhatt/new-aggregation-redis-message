// import { useEffect, useState } from "react";
// import { fetchClasses } from "../api/api";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import Loader from "../components/Loadar";

// const ClassPage = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [params] = useSearchParams();
//   const schoolName = params.get("schoolName");
//   const branchName = params.get("branchName");
//   const standard = params.get("standard");

//   const navigate = useNavigate();

//   const loadData = async () => {
//     try {
//       const res = await fetchClasses(schoolName, branchName, standard);
//       setData(res.data.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (schoolName && branchName && standard) {
//       loadData();
//     }
//   }, [schoolName, branchName, standard]);

//   return (
//     <div className="container">
//       <button onClick={() => navigate(-1)}>Back</button>

//       <h2>
//         {schoolName} | {branchName} | Class {standard}
//       </h2>

//       {loading ? (
//         <Loader />
//       ) : (
//         <div>
//           {data.map((item, i) => (
//             <div key={i} className="card">
//               {item.studentName} - {item.marks}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ClassPage;

import { useEffect, useState } from "react";
import { fetchClasses } from "../api/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loadar";

const ClassPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [params] = useSearchParams();
  const schoolName = params.get("schoolName");
  const branchName = params.get("branchName");
  const standard = params.get("standard");

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const res = await fetchClasses(schoolName, branchName, standard);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolName && branchName && standard) {
      loadData();
    }
  }, [schoolName, branchName, standard]);

  return (
    <div className="container">
      <button onClick={() => navigate(-1)}>Back</button>

      <h2>
        {schoolName} | {branchName} | Class {standard}
      </h2>

      {loading ? (
        <Loader />
      ) : data.length === 0 ? (
        <p style={{ color: "red" }}>No students found</p>
      ) : (
        <div className="grid">
          {data.map((student, i) => (
            <div key={i} className="card">
              <h3>Name : {student.studentName}</h3>

              <p>
                {/* {student.class} | {student.branch} */}
                {student.class} | {student.branch}
              </p>

              {/* subjects  */}
              {/* <div className="subjects">
                {student.subjects?.map((sub, index) => (
                  <div key={index} className="subject">
                    {sub.subject}: {sub.marks}
                  </div>
                ))}
              </div> */}
              <div className="subjects">
                {student.subjects && Object.entries(student.subjects).map(([subject, marks], index) => (
                  <div key={index} className="subject">
                    {subject}: {marks}
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <h4>Total: {student.totalMarks}</h4>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassPage;