import { v2 as cloudinary } from 'cloudinary'

const connectCloudinary = async () => {
    // Support either CLOUDINARY_URL or discrete env vars
    if (process.env.CLOUDINARY_URL) {
        // SDK will read CLOUDINARY_URL automatically
        cloudinary.config({ secure: true })
        return
    }

    if (process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_SECRET_KEY) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY,
            secure: true
        })
    }
}

export default connectCloudinary