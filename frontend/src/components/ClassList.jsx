// const ClassList = ({data}) => {
//   return (
//  <>
//       {/* total classeses */}
//       <div className="card-container">
//         {data.map((classes, index) => (
//           <div key={index} className="card">
//             <h2>{classes.classes_name}</h2>
//             <div className="grid">
//               {classes.classes.map((cls, i) => (
//                 <div key={i} className="badge">
//                   {cls.class}: {cls.students}
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </>
//   )
// }

// export default ClassList



const ClassList = ({ data }) => {
  return (
    <>
      {/* total classeses */}
      <div className="card-container">
        {data.map((classes, index) => (
          <div key={index} className="card">
            <h2>{classes.classes_name}</h2>
            <div className="grid">
              {classes.classes.map((cls, i) => (
                <div key={i} className="badge">
                  {cls.class}: {cls.students}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default ClassList
