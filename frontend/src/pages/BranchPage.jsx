import { useEffect, useState } from "react";
import { fetchBranches } from "../api/api";
import BranchList from "../components/BranchList";
import Loader from "../components/Loadar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const BranchPage = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
 const [message,setmessage] = useState("")
  const [params] = useSearchParams();
  const schoolName = params.get("schoolName");

  const navigate = useNavigate();

  const loadBranches = async () => {
    try {
      const branchRes = await fetchBranches(schoolName);

      console.log("api responce:", branchRes.data);

      setBranches(branchRes.data.data || []);

      // toast.success(
      //   `${branchRes.data.totalBranches || 0} branches loaded`
      // );
      setmessage(branchRes.data.source )
    } catch (err) {
      console.error(err);
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolName) loadBranches();
  }, [schoolName]);

  if (!schoolName) {
    return <p>Please select a school first</p>;
  }

  return (
    <div className="container">
      <button id="switch" onClick={() => navigate("/")}>Back</button>
      <h1>{schoolName} - Branches</h1>

  <p style={{ textAlign: "center", color: "red" }}>
              Data come from {message}
            </p>

      {loading ? (
        <Loader />
      ) : (
        <BranchList data={branches} schoolName={schoolName} />
      )}
    </div>
  );
};

export default BranchPage;