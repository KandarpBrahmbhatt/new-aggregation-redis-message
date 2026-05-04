import express from 'express'
import { getAggregatedListing } from '../controller/aggregate.controller.js'

const aggregateRouter = express.Router()

aggregateRouter.get("/listing", getAggregatedListing)

export default aggregateRouter
