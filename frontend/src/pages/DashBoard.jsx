import { useEffect, useState } from "react";
import { fetchSchools, fetchBranches, fetchClasses } from "../api/api";
// import SchoolList from "../components/SchoolList";
import BranchList from "../components/BranchList";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loadar";
// import BranchChart from "../components/BranchChart";
import SchoolSummary from "../components/SchoolSummary";
import ClassList from "../components/ClassList";
import { toast } from "react-toastify";

const getResponseData = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  return response?.data?.data || [];
};

const Dashboard = () => {
  const [schoolName, setSchoolName] = useState("");
  const [schools, setSchools] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(""); // typing
  const [searchValue, setSearchValue] = useState(""); // actual search

  const [classes, setclasses] = useState([])
  const [branchName, setbranchName] = useState("")
  const [standard, setStandard] = useState("")
  const [marks,setmarks] = useState("")
  const [message,setmessage] = useState("")
  const loadData = async (value = "") => {
    try {
      setLoading(true);

      const schoolRes = await fetchSchools(value);
      setSchools(getResponseData(schoolRes));

      const branchRes = await fetchBranches(value);
      const branchData = getResponseData(branchRes);
      setBranches(branchData);

      const source = branchRes.data.source || branchRes.data.message;
      toast.success(
        source
          ? `Data come from ${source}`
          : `${branchData.length} branches loaded`
      );
setmessage(branchRes.data.source )
      //       const classesRes = await fetchClasses(value)
      //       setclasses(classesRes.data.data)
      // console.log(classesRes)

      const classesRes = await fetchClasses("", "", "");
      setclasses(classesRes?.data?.data || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  //  Load ALL data initially
  useEffect(() => {
    loadData(""); // default
  }, []);
  return (
    <div className="container">
      <h1>School Dashboard</h1>

      <SearchBar
        value={inputValue}
        onChange={setInputValue}
        onSearch={() => {
          setSearchValue(inputValue);
          loadData(inputValue);
        }}
      />

      {loading ? (
        <Loader />
      ) : (
        <>
        <p style={{ textAlign: "center", color: "red" }}>
              Data come from {message}
            </p>
          {/* <h2>Data</h2> */}

          {!searchValue && <SchoolSummary data={schools} />}

          {/*  SEARCH RESULT */}
          {searchValue && branches.length > 0 && (
            <>
              <BranchList data={branches} />
              {/* <BranchChart data={branches} /> */}
            </>
          )}
          <ClassList data={classes} />
          {/*  NOT FOUND */}
          {searchValue && branches.length === 0 && (
            <p style={{ textAlign: "center", color: "red" }}>
              No data found for "{searchValue}"
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
