import express from 'express'
import { getBranchWiseData, getSchoolListing, getStudentsWithMarks } from '../controller/new.controller.js'

const newRouter = express.Router()

newRouter.get("/schools", getSchoolListing)
newRouter.get("/branchlisting", getBranchWiseData)
newRouter.get("/getStudentsWithMarks", getStudentsWithMarks)

export default newRouter
