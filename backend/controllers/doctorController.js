import doctorModel from "../models/doctorModel.js"

// Public API: get all doctors (without passwords)
export const listPublicDoctors = async (req, res) => {
    try{
        const doctors = await doctorModel.find({}).select('-password')
        return res.json({ success: true, doctors })
    }catch(err){
        return res.status(500).json({ success: false, message: err.message })
    }
}

// Public API: get one doctor by id
export const getDoctorById = async (req, res) => {
    try{
        const { id } = req.params
        const doc = await doctorModel.findById(id).select('-password')
        if(!doc){ return res.status(404).json({ success:false, message:'Doctor not found' }) }
        return res.json({ success:true, doctor: doc })
    }catch(err){
        return res.status(500).json({ success:false, message: err.message })
    }
}

// Admin-secured CRUD helpers
export const adminGetDoctor = async (req, res) => {
    try{
        const { id } = req.params
        const doc = await doctorModel.findById(id).select('-password')
        if(!doc){ return res.status(404).json({ success:false, message:'Doctor not found' }) }
        return res.json({ success:true, doctor: doc })
    }catch(err){
        return res.status(500).json({ success:false, message: err.message })
    }
}

export const adminUpdateDoctor = async (req, res) => {
    try{
        const { id } = req.params
        const updateFields = { ...req.body }
        // Do not allow password edits here
        delete updateFields.password

        // Handle optional image file
        if (req.file) {
            const { v2: cloudinary } = await import('cloudinary')
            let imageUrl = ''
            const useCloudinary = ((process.env.USE_CLOUDINARY || '').toLowerCase() === 'true') || !!process.env.CLOUDINARY_URL
            if(useCloudinary){
                const uploaded = await cloudinary.uploader.upload(req.file.path, { resource_type:'image' })
                imageUrl = uploaded.secure_url
            } else {
                const base = `${req.protocol}://${req.get('host')}`
                imageUrl = `${base}/uploads/${req.file.filename}`
            }
            updateFields.image = imageUrl
        }

        if (updateFields.address && typeof updateFields.address === 'string') {
            try { updateFields.address = JSON.parse(updateFields.address) } catch {}
        }

        const updated = await doctorModel.findByIdAndUpdate(id, updateFields, { new: true }).select('-password')
        if(!updated){ return res.status(404).json({ success:false, message:'Doctor not found' }) }
        return res.json({ success:true, doctor: updated })
    }catch(err){
        return res.status(500).json({ success:false, message: err.message })
    }
}

export const adminDeleteDoctor = async (req, res) => {
    try{
        const { id } = req.params
        const deleted = await doctorModel.findByIdAndDelete(id)
        if(!deleted){ return res.status(404).json({ success:false, message:'Doctor not found' }) }
        return res.json({ success:true, message:'Doctor deleted' })
    }catch(err){
        return res.status(500).json({ success:false, message: err.message })
    }
}


