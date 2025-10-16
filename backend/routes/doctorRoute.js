import express from 'express'
import { listPublicDoctors, getDoctorById } from '../controllers/doctorController.js'

const doctorRouter = express.Router()

// Public endpoints
doctorRouter.get('/', listPublicDoctors)
doctorRouter.get('/:id', getDoctorById)

export default doctorRouter


