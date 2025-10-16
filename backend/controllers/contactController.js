import contactModel from '../models/contactModel.js'
import jwt from 'jsonwebtoken'

export const submitContact = async (req, res) => {
  try{
    const { name, email, phone, subject, message, token } = req.body || {}
    if(!name || !email || !message){
      return res.status(400).json({ success:false, message:'Name, email and message are required' })
    }
    let userId
    if(token){
      try{ const decoded = jwt.verify(token, process.env.JWT_SECRET); userId = decoded.id || decoded.userId }catch{}
    }
    const entry = await contactModel.create({ userId, name, email, phone, subject, message })
    console.log('[contact] saved:', { id: entry._id, name: entry.name, email: entry.email })
    res.status(201).json({ success:true, contact: entry })
  }catch(error){
    console.error('[contact] error:', error)
    res.status(500).json({ success:false, message:error.message })
  }
}

export const listContacts = async (req, res) => {
  try{
    const items = await contactModel.find({}).sort({ createdAt: -1 })
    res.json({ success:true, contacts: items })
  }catch(error){ res.status(500).json({ success:false, message:error.message }) }
}

export const replyContact = async (req, res) => {
  try{
    const { id } = req.params
    const { reply } = req.body || {}
    if(!reply) return res.status(400).json({ success:false, message:'Reply is required' })
    const updated = await contactModel.findByIdAndUpdate(
      id,
      { $set: { adminReply: reply, status: 'replied', repliedAt: new Date() } },
      { new: true }
    )
    if(!updated) return res.status(404).json({ success:false, message:'Contact not found' })
    res.json({ success:true, contact: updated })
  }catch(error){ res.status(500).json({ success:false, message:error.message }) }
}

export const getMyContacts = async (req, res) => {
  try{
    const userId = req.userId
    if(!userId) return res.status(400).json({ success:false, message:'Unauthorized' })
    const items = await contactModel.find({ userId }).sort({ createdAt: -1 })
    res.json({ success:true, contacts: items })
  }catch(error){ res.status(500).json({ success:false, message:error.message }) }
}

export const deleteContact = async (req, res) => {
  try{
    const { id } = req.params
    // Attempt to delete and return the deleted doc (helps to verify)
    const deleted = await contactModel.findByIdAndDelete(id)
    if(!deleted){
      return res.status(404).json({ success:false, message:'Contact not found' })
    }
    console.log('[contact] deleted:', { id: deleted._id, email: deleted.email })
    res.json({ success:true, id: deleted._id })
  }catch(error){ res.status(500).json({ success:false, message:error.message }) }
}


