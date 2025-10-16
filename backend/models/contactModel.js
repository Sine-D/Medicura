import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    status: { type: String, enum: ['new','replied'], default: 'new' },
    adminReply: { type: String, default: '' },
    repliedAt: { type: Date }
  },
  { timestamps: true }
)

const contactModel = mongoose.models.contact || mongoose.model('contact', contactSchema)

export default contactModel


