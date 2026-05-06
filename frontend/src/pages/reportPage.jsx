import axios from "axios"
import { useEffect } from "react";
import { useState } from "react"

const reportPage = () => {
 const [schools, setSchools] = useState([]);
    const [studentname, setstudentname] = useState()
    const [schoolName, setschoolname] = useState()
    const [branchname, setbranchName] = useState()
    const [classes, setclasses] = useState([])
    const [branchName, setbranchName] = useState("")
    const [standard, setStandard] = useState("")
    const [marks, setmarks] = useState("")
    const [message, setmessage] = useState("")

    const fetchStudents = async (req, resp) => {
        const serverlUrl = "http://localhost:5000"
        try {
            const result = await axios.get(`${serverlUrl}/getStudentsWithMarks`, {
                params: {
                    ...(schoolName && { schoolName }),
                    ...(branchName && { branchName }),
                    ...(studentname && { studentname })
                }})

            const data = result.data.schools || result.data
            setSchools(data)
        } catch (error) {
            console.log(error)
            
        }
    }

    useEffect(()=>{
            fetchStudents()
    },[])
    return (
        <>
            <h1>student Report</h1>

            <table className='table'>
                <thead>
                    <tr>
                        <td>{}</td>
                        <td>standard</td>
                        <td>marks</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {schools.map((item,index)=>(
                            <header>
                                <div>
                                    <div>
                                        <h3>Report card</h3>
                                        <p>{item.schoolName}</p>
                                    </div>
                                </div>
                            <div>
                                <p></p>
                            </div>
                            </header>

                        ))}
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default reportPage
