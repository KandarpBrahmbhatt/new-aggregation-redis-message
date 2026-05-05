import express from 'express'
import { branchWiseListing, getSchoolListing, markswiseListing } from '../controller/aggregate.controller.js'

const aggregateRouter = express.Router()

aggregateRouter.get("/listing", getSchoolListing)
aggregateRouter.get("/branchWiseListing",branchWiseListing)
aggregateRouter.get("/markswiseListing",markswiseListing)
export default aggregateRouter
