import express from 'express'
import { registerUser, loginUser, getProfile, updateProfile } from '../controllers/userController.js'
import { submitContact, getMyContacts } from '../controllers/contactController.js'
import { createAppointment, getMyAppointments, updateAppointment, deleteAppointment } from '../controllers/appointmentController.js'
import authUser from '../middlewares/authUser.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/me', authUser, getProfile)
userRouter.put('/me', authUser, updateProfile)

// Public contact submission
userRouter.post('/contact', submitContact)
// User can view their own contact messages and replies
userRouter.get('/my-contacts', authUser, getMyContacts)

// Appointments CRUD (user scope)
userRouter.post('/appointments', authUser, createAppointment)
userRouter.get('/appointments', authUser, getMyAppointments)
userRouter.put('/appointments/:id', authUser, updateAppointment)
userRouter.delete('/appointments/:id', authUser, deleteAppointment)



export default userRouter