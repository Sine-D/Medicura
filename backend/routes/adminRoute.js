import express from 'express'
import { addDoctor,loginAdmin,allDoctors,getDashboardStats } from '../controllers/adminController.js'
import { adminGetDoctor, adminUpdateDoctor, adminDeleteDoctor } from '../controllers/doctorController.js'
import { listContacts, replyContact, deleteContact } from '../controllers/contactController.js'
import { analyticsTimeSeries, analyticsBySpeciality, analyticsStatusBreakdown } from '../controllers/appointmentController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'
import cache from '../middlewares/cache.js'

const adminRouter = express.Router()

adminRouter.post('/add-doctor', authAdmin,upload.single('image'), addDoctor)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors',authAdmin,allDoctors)
adminRouter.get('/dashboard-stats', authAdmin, getDashboardStats)
// Doctor CRUD for admin
adminRouter.get('/doctor/:id', authAdmin, adminGetDoctor)
adminRouter.put('/doctor/:id', authAdmin, upload.single('image'), adminUpdateDoctor)
adminRouter.delete('/doctor/:id', authAdmin, adminDeleteDoctor)
// Contact management
adminRouter.get('/contacts', authAdmin, listContacts)
adminRouter.post('/contacts/:id/reply', authAdmin, replyContact)
adminRouter.delete('/contacts/:id', authAdmin, deleteContact)

// Analytics (cached 10 minutes)
adminRouter.get('/analytics/appointments/time-series', authAdmin, cache(600000), analyticsTimeSeries)
adminRouter.get('/analytics/appointments/by-speciality', authAdmin, cache(600000), analyticsBySpeciality)
adminRouter.get('/analytics/appointments/status-breakdown', authAdmin, cache(600000), analyticsStatusBreakdown)

export default adminRouter