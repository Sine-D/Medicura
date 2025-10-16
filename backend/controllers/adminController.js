import validator from "validator"
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { checkConnection } from '../config/mongodb.js'


// API for adding doctor
const addDoctor = async (req, res) => {
    try {
        // Check if database is connected
        const dbStatus = checkConnection()
        if (!dbStatus.isConnected) {
            console.error("Database not connected. Status:", dbStatus.state)
            return res.json({success: false, message: "Database connection not established"})
        }
        
        console.log("Database connection verified:", dbStatus.state)
    
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
    const imageFile = req.file

    //checking for all data to add doctor
    if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address){
        return res.json({success:false,message:"Missing Details"})
    }

    //validating email format
    if(!validator.isEmail(email)){
        return res.json({success:false,message:"please enter a valid email"})
    }

    //validating strong password
    if(password.length < 8){
        return res.json({success:false,message:"please enter a strong password"})
    }

    // hashing doctor password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Upload strategy: prefer local uploads unless USE_CLOUDINARY==='true'
    let imageUrl = ""
    const useCloudinary = ((process.env.USE_CLOUDINARY || '').toLowerCase() === 'true') || !!process.env.CLOUDINARY_URL
    try {
        if(useCloudinary && process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_SECRET_KEY){
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            imageUrl = imageUpload.secure_url
        } else {
            const base = `${req.protocol}://${req.get('host')}`
            imageUrl = `${base}/uploads/${imageFile.filename}`
        }
    } catch (cloudinaryError) {
        console.log("Image upload error:", cloudinaryError.message)
        const base = `${req.protocol}://${req.get('host')}`
        imageUrl = `${base}/uploads/${imageFile?.filename || ''}`
    }

    const doctorData = {
        name,
        email,
        image: imageUrl,
        password: hashedPassword,
        speciality,
        degree,
        experience,
        about,
        fees,
        address: JSON.parse(address),
        available: true, // Set doctor as available by default
        date: Date.now()
    }

    console.log("Creating new doctor with data:", doctorData)
    
    const newDoctor = new doctorModel(doctorData)
    console.log("Doctor model created:", newDoctor)
    
    const savedDoctor = await newDoctor.save()
    console.log("Doctor saved successfully:", savedDoctor)

    res.json({success:true,message:"Doctor Added Successfully"})






    } catch (error) {
        console.error("Error in addDoctor:", error)
        console.error("Error details:", {
            message: error.message,
            name: error.name,
            stack: error.stack
        })
        
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            console.error("Validation errors:", error.errors)
            return res.json({success: false, message: "Validation failed: " + Object.values(error.errors).map(e => e.message).join(', ')})
        }
        
        if (error.code === 11000) {
            return res.json({success: false, message: "Doctor with this email already exists"})
        }
        
        res.json({success: false, message: "Failed to add doctor: " + error.message})
    }
}

// API for admin login
const loginAdmin = async (req,res) => {
    try {

        const {email,password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(
                { 
                    userId: email, 
                    email: email, 
                    userType: 'admin',
                    name: 'Administrator' 
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            )
            res.json({success: true, token, user: { id: email, name: 'Administrator', email: email, userType: 'admin' }})
        }
        else {
            res.json({success: false, message:"Invalid credentials"})   
        }

    } catch (error) {
    console.log(error)
    res.json({success:false,message:error.message})
    }
}


// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
    
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true,doctors})
    
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


// API to get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const userModel = (await import('../models/userModel.js')).default
        const appointmentModel = (await import('../models/appointmentModel.js')).default
        const contactModel = (await import('../models/contactModel.js')).default
        
        // Get counts
        const totalUsers = await userModel.countDocuments()
        const totalDoctors = await doctorModel.countDocuments()
        const totalAppointments = await appointmentModel.countDocuments()
        const pendingContacts = await contactModel.countDocuments({ status: 'new' })
        
        // Get today's appointments
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        const todayAppointments = await appointmentModel.countDocuments({
            date: { $gte: today, $lt: tomorrow }
        })
        
        // Get this month's appointments
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const thisMonthAppointments = await appointmentModel.countDocuments({
            date: { $gte: startOfMonth }
        })
        
        // Calculate total revenue
        const appointments = await appointmentModel.find({ status: 'completed' })
        const totalRevenue = appointments.reduce((sum, apt) => sum + (apt.fees || 0), 0)
        
        // Get recent activities
        const recentUsers = await userModel.find({}).sort({ createdAt: -1 }).limit(5).select('name email createdAt')
        const recentAppointments = await appointmentModel.find({}).sort({ createdAt: -1 }).limit(5).populate('userId', 'name email')
        const recentContacts = await contactModel.find({}).sort({ createdAt: -1 }).limit(5)
        
        // Get appointment status breakdown
        const appointmentStats = await appointmentModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ])
        
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalDoctors,
                totalAppointments,
                todayAppointments,
                thisMonthAppointments,
                pendingContacts,
                totalRevenue,
                appointmentStats
            },
            recent: {
                users: recentUsers,
                appointments: recentAppointments,
                contacts: recentContacts
            }
        })
        
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export {addDoctor,loginAdmin,allDoctors,getDashboardStats}