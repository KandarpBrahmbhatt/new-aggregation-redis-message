// import React from "react";
import Dashboard from "./pages/DashBoard";
import BranchPage from "./pages/BranchPage";
import {BrowserRouter as Router ,Routes,Route} from 'react-router-dom'
import "./App.css";
import ClassPage from "./pages/ClassPage";
import { ToastContainer } from 'react-toastify';

const App = () => {
  return(
    <>
      <Router>
          <ToastContainer />
        <Routes>
          <Route path="/" element={  <Dashboard />}/>
          <Route path="/branch" element={  <BranchPage />}/>
          <Route path="/class" element={  <ClassPage />}/>
        </Routes>
      </Router>
    </>
  )
};

export default App;