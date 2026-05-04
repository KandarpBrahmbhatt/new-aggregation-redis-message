// import axios from 'axios'
// import React from 'react'
// import { useEffect } from 'react'
// import { useState } from 'react'

// const newSchoolFatch = () => {
//     const [school, setSchool] = useState()
//     const getSchoollisting = async () => {
//         try {
//             const serverUrl = "http://localhost:5000/api/new";
//             const res = await axios.get(`${serverUrl}/schools`)
//             const data = res.data.school || res.data;
//             setSchool(data)
//         } catch (error) {
//             console.log(error)
//         }
//     }

//     useEffect({
//         getSchoollisting()
//     }, [1000])
//     return (
//         <>
//             <div>

//             </div>
//         </>
//     )
// }

// export default newSchoolFatch
