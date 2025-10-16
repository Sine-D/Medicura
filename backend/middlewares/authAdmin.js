import jwt from 'jsonwebtoken'

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
    
        const {atoken} = req.headers
        if (!atoken) {
            return res.json({success: false, message:'Not Authorized Login Again' })
        }
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)
    
        if (token_decode.userType !== 'admin' || token_decode.email !== process.env.ADMIN_EMAIL){
            return res.json({success: false, message: 'Not Authorized Login Again' })
        }
        next()


    } catch (error) {
        console.log(error)
        // Handle JWT expiration specifically
        if (error.name === 'TokenExpiredError') {
            return res.json({success: false, message: 'Session expired. Please login again.' })
        }
        // Handle other JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.json({success: false, message: 'Invalid token. Please login again.' })
        }
        // Handle other errors
        res.json({success: false, message: 'Authentication failed. Please login again.' })
    }
}

export default authAdmin