import appointmentModel from '../models/appointmentModel.js'
import doctorModel from '../models/doctorModel.js'

// Create
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, slot, notes, doctorName: bodyDoctorName, speciality: bodySpeciality, fees: bodyFees } = req.body
    const userId = req.userId || req.body.userId

    if (!userId) return res.json({ success: false, message: 'Unauthorized' })
    if (!doctorId || !date || !slot) {
      return res.json({ success: false, message: 'Missing required fields' })
    }

    // doctor may be a static seed with string id in frontend; tolerate missing DB doctor
    let doctor = null
    try { doctor = await doctorModel.findById(doctorId) } catch {}

    const derivedDoctorName = (doctor?.name || bodyDoctorName || '').toString().trim() || 'Unknown Doctor'
    const derivedSpeciality = (doctor?.speciality || bodySpeciality || '').toString().trim() || 'General'
    const derivedFees = Number(doctor?.fees ?? bodyFees ?? 0) || 0

    // Debug log to verify incoming body and derived values
    console.log('[createAppointment] body:', req.body)
    console.log('[createAppointment] derived:', { derivedDoctorName, derivedSpeciality, derivedFees })

    const appt = await appointmentModel.create({
      userId,
      doctorId,
      date: new Date(date),
      slot,
      notes: notes || '',
      fees: derivedFees,
      doctorName: derivedDoctorName,
      speciality: derivedSpeciality
    })

    res.json({ success: true, appointment: appt })
  } catch (error) {
    console.error(error)
    res.json({ success: false, message: error.message })
  }
}

// Read (list for user)
export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.userId || req.query.userId
    if (!userId) return res.json({ success: false, message: 'Unauthorized' })
    const appts = await appointmentModel.find({ userId }).sort({ createdAt: -1 })
    res.json({ success: true, appointments: appts })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Update
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params
    const { date, slot, status, notes } = req.body
    const userId = req.userId || req.body.userId
    if (!userId) return res.json({ success: false, message: 'Unauthorized' })

    const appt = await appointmentModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { date: date ? new Date(date) : undefined, slot, status, notes } },
      { new: true }
    )
    if (!appt) return res.json({ success: false, message: 'Appointment not found' })
    res.json({ success: true, appointment: appt })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Delete (cancel)
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId || req.body.userId
    if (!userId) return res.json({ success: false, message: 'Unauthorized' })
    const appt = await appointmentModel.findOneAndDelete({ _id: id, userId })
    if (!appt) return res.json({ success: false, message: 'Appointment not found' })
    res.json({ success: true })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const analyticsTimeSeries = async (req, res) => {
  try{
    const { granularity = 'day', from, to } = req.query
    const match = {}
    if(from || to){
      match.date = {}
      if(from) match.date.$gte = new Date(from)
      if(to) match.date.$lte = new Date(to)
    }
    const groupId = granularity === 'month'
      ? { y: { $year: "$date" }, m: { $month: "$date" } }
      : { y: { $year: "$date" }, m: { $month: "$date" }, d: { $dayOfMonth: "$date" } }

    const data = await appointmentModel.aggregate([
      { $match: match },
      { $group: { _id: groupId, count: { $sum: 1 }, revenue: { $sum: "$fees" } } },
      { $sort: { "_id.y": 1, "_id.m": 1, ...(granularity==='day' ? { "_id.d": 1 } : {}) } }
    ])

    const series = data.map(it => ({
      date: granularity === 'month'
        ? `${it._id.y}-${String(it._id.m).padStart(2,'0')}`
        : `${it._id.y}-${String(it._id.m).padStart(2,'0')}-${String(it._id.d).padStart(2,'0')}`,
      count: it.count,
      revenue: it.revenue
    }))

    res.json({ success: true, series })
  }catch(err){ res.json({ success:false, message: err.message }) }
}

export const analyticsBySpeciality = async (req, res) => {
  try{
    const { from, to } = req.query
    const match = {}
    if(from || to){
      match.date = {}
      if(from) match.date.$gte = new Date(from)
      if(to) match.date.$lte = new Date(to)
    }

    const data = await appointmentModel.aggregate([
      { $match: match },
      { $group: { _id: "$speciality", count: { $sum: 1 }, revenue: { $sum: "$fees" } } },
      { $sort: { count: -1 } }
    ])

    res.json({ success: true, items: data.map(d => ({ speciality: d._id || 'Unknown', count: d.count, revenue: d.revenue })) })
  }catch(err){ res.json({ success:false, message: err.message }) }
}

export const analyticsStatusBreakdown = async (req, res) => {
  try{
    const { from, to } = req.query
    const match = {}
    if(from || to){
      match.date = {}
      if(from) match.date.$gte = new Date(from)
      if(to) match.date.$lte = new Date(to)
    }

    const data = await appointmentModel.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])

    res.json({ success: true, items: data.map(d => ({ status: d._id, count: d.count })) })
  }catch(err){ res.json({ success:false, message: err.message }) }
}


