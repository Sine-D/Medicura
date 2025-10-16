import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'


// API to register user
const registerUser = async (req, res) => {

    try {

        const { name, email, password, image, address, gender, dob, phone } = req.body

        if( !name || !password || !email ) {
            return res.json({success:false, message:"Missing Details"})
        }

        // validating email
        if (!validator.isEmail(email)) {
            return res.json({success:false,message:"enter a valid email"})
        }

        // validating password
        if (password.length<8) {
            return res.json({success:false,message:"enter a strong password"})
        }


        // check if user already exists
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" })
        }

        // hashing password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
            // optional fields if provided from client
            image: image || undefined,
            address: address || undefined,
            gender: gender || undefined,
            dob: dob || undefined,
            phone: phone || undefined
        }
        
        const newUser = new userModel(userData)
        const user = await newUser.save()

        // Do not log the user in automatically; return minimal public data
        const safeUser = { id: user._id, name: user.name, email: user.email }
        res.json({ success: true, message: "Account created", user: safeUser })

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


// API for user login
const loginUser = async (req,res) => {

    try {
    
        const{email,password} = req.body
        const user = await userModel.findOne({email})
        if(!user){
            return res.json({success:false,message:"User not found"})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (isPasswordValid) {
            const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res. json({success:false, message:error.message})
    }
}

// Get current user profile
const getProfile = async (req, res) => {
    try{
        const userId = req.userId
        const user = await userModel.findById(userId).select('-password')
        if(!user) return res.json({ success:false, message:'User not found' })
        res.json({ success:true, user })
    }catch(error){ res.json({ success:false, message:error.message }) }
}

// Update current user profile
const updateProfile = async (req, res) => {
    try{
        const userId = req.userId
        const { name, image, gender, dob, phone, address } = req.body
        const updated = await userModel.findByIdAndUpdate(
            userId,
            { $set: { name, image, gender, dob, phone, address } },
            { new: true, runValidators: true }
        ).select('-password')
        res.json({ success:true, user: updated })
    }catch(error){ res.json({ success:false, message:error.message }) }
}

export {registerUser,loginUser, getProfile, updateProfile}