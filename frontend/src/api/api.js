import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/new"
});

//  Schools
export const fetchSchools = () => API.get(`/schools`);

//  Branches 
export const fetchBranches = (schoolName) => {
  if (!schoolName) return API.get(`/branchlisting`);
  return API.get(`/branchlisting?schoolName=${encodeURIComponent(schoolName)}`);
};

// classes
export const fetchClasses = (schoolName, branchName, standard) => {
  if (!schoolName || !branchName || !standard) {
    return Promise.resolve({ data: { data: [] } }); // prevent API call
  }

  return API.get(
    `/getStudentsWithMarks?branchName=${encodeURIComponent(branchName)}&schoolName=${encodeURIComponent(schoolName)}&standard=${encodeURIComponent(standard)}`
  );
};

export const downloadStudentPDF = async (studentId) => {
  return axios.get(`/singleStudent/${studentId}`, {
    responseType: "blob", // Critical for binary data like PDFs
  });
};

// export const fetchStudents = ()=>{
//   return API.get("/singleStudent/:id")
// }
export default API;
