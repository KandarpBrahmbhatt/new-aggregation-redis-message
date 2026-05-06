import express from 'express'
import { downloadStudentPDF, getBranchWiseData, getSchoolListing, getStudentsWithMarks } from '../controller/new.controller.js'

const newRouter = express.Router()

newRouter.get("/schools", getSchoolListing)
newRouter.get("/branchlisting", getBranchWiseData)
newRouter.get("/getStudentsWithMarks", getStudentsWithMarks)
newRouter.get("/singleStudent/:id",downloadStudentPDF)
export default newRouter
