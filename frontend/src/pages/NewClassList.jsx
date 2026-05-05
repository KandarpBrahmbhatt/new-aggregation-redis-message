import axios from 'axios'
import { useEffect, useSearchParams } from 'react'

const NewClassList = () => {



  const [params] = useSearchParams();
  const schoolName = params.get("schoolName");
  const branchName = params.get("branchName");
  const standard = params.get("standard");


    const loaddata = async()=>{
        try {
            const serverUrl = "http://localhost:5000"
            const resp = await axios.get(`${serverUrl}/getStudentsWithMarks?schoolName=${schoolName}&branchName=${branchName}&standard=${standard}`)

            setSchoolName(resp.data.schoolName)
            setbranchName(resp.data.branchName)
            setStandard(resp.data.standard)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
loaddata()
    },[])
  return (
<>
    <table>

      <h2>
        {schoolName} | {branchName} | Class {standard}
      </h2>
           <tr>
             <th>NO</th>
            <th>name</th>
            <th>branch</th>
            <th>class</th>
            <th>maths</th>
            <th>science</th>
            <th>english</th>
           </tr>

           <tr>
            <td>{}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
           </tr>
    </table>
</>
  )
}

export default NewClassList
