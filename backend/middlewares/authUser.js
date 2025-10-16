import jwt from 'jsonwebtoken'

const authUser = (req, res, next) => {
  try{
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null
    if(!token){
      return res.json({ success:false, message:'Unauthorized' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId || decoded.id || decoded._id
    req.userEmail = decoded.email || undefined
    if(!req.userId){
      return res.json({ success:false, message:'Unauthorized' })
    }
    next()
  }catch(err){
    // Handle JWT expiration specifically
    if (err.name === 'TokenExpiredError') {
      return res.json({ success:false, message:'Session expired. Please login again.' })
    }
    // Handle other JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.json({ success:false, message:'Invalid token. Please login again.' })
    }
    // Handle other errors
    return res.json({ success:false, message:'Unauthorized' })
  }
}

export default authUser


