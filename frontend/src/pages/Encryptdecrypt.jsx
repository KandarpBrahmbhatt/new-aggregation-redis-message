import React, { useState } from 'react'
import { encryptData } from '../../../backend/utils/AES'

const Encryptdecrypt = () => {
    const [text,setText] = useState()
const [screen,setScreen] = useState("encrypt")
    const handleClick = ()=>{
        try {
            if (screen ==="encrypt") {
                encryptData()
            }   
        } catch (error) {
            decrypdData()
            console.log(error)
        }
    }

    const encrypt =()=>{
        try {
encryptData()
        } catch (error) {
            console.log(error)
        }
    }

    const decrypt = ()=>{
        try {
            decryptData()
        } catch (error) {
            console.log(error)
        }
    }
  return (
    <>
      <div className="container">
        <div>
            <button onClick={encrypt()}>Encrypt</button>
            <button onClick={decrypt()}>Decrypt</button>
        </div>

        <div className="card">
            <textarea name="" id="" value={text} onChange={()=>{}} placeholder={screen ==="encrypt"?"Enter Your Text":"Enter Enter  enrypted"}></textarea>
            <button onClick={handleClick}></button>
        </div>
      </div>
    </>
  )
}

export default Encryptdecrypt
