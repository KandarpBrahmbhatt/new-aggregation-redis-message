import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SchoolSummary = ({ data = [] }) => {
  const navigate = useNavigate();

  const handleclick = (school) => {
    navigate(`/branch?schoolName=${encodeURIComponent(school.schoolName)}`);
    toast.success("Go to Branches page");
  };

  return (
    <div className="card-container">
      {data.map((school, index) => {
        const classStats = school.classStats || school.standards || [];

        const totalStudents = classStats.reduce(
          (sum, std) => sum + (std.totalStudents || 0),
          0
        );

        return (
          <div key={index} className="card">
            <h2>{school.schoolName}</h2>

            <button id="switch" onClick={() => handleclick(school)}>
              View Branches
            </button>

            <p><strong>Total Students:</strong> {totalStudents}</p>

            <div className="grid">
              {classStats.map((std, i) => (
                <div key={i} className="badge">
                  Class {std.standard}: {std.totalStudents || 0}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SchoolSummary;
