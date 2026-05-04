// import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchBranches } from '../api/api'
import { useEffect } from 'react'
import Loader from '../components/Loadar'
import BranchList from '../components/BranchList'

const newBranchPage = () => {
    const[Branches ,setBranches] = useState([])
    const [loading ,setLoading] = useState(true)
    const navigate  = useNavigate()

    const loadBranches = async()=>{
        try {
            const branchRes = await fetchBranches("")
            setBranches(branchRes.data.data)
        } catch (error) {
            console.error(error)
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        (async()=>{
            await loadBranches()
        })();
    },[]);

    const handleGoBack = () =>{
        navigate("/")
    }
  return (
    <>
      <div className='container'>
        <button onClick={handleGoBack} style={{marginBottom:"1rem"}}>back dashboard</button>
        <h1>All Branches</h1>

        {loading?(
                <Loader/>
            ):Branches.length > 0?(
                <BranchList data={Branches}/>
            ):(
                <p style={{textAlign:"center",color:"red"}}>No Branch Found</p>
            )
        }
      </div>
    </>
  )
}

export default newBranchPage
