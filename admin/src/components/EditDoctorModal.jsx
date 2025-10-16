import React, { useEffect, useMemo, useState } from 'react'

const initialForm = {
  name: '',
  speciality: '',
  degree: '',
  experience: '',
  fees: '',
  about: '',
  address: { line1: '', line2: '', city: '', state: '', zip: '' },
  image: null
}

const fieldClass = 'w-full px-3 py-2 border rounded-md text-sm'

const Modal = ({ open, onClose, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-lg border p-4 sm:p-6">
        {children}
      </div>
    </div>
  )
}

const EditDoctorModal = ({ open, doctor, onClose, onSubmit, submitting }) => {
  const [form, setForm] = useState(initialForm)
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (doctor) {
      setForm({
        name: doctor.name || '',
        speciality: doctor.speciality || '',
        degree: doctor.degree || '',
        experience: doctor.experience || '',
        fees: doctor.fees ?? '',
        about: doctor.about || '',
        address: {
          line1: doctor.address?.line1 || '',
          line2: doctor.address?.line2 || '',
          city: doctor.address?.city || '',
          state: doctor.address?.state || '',
          zip: doctor.address?.zip || ''
        },
        image: null
      })
      setPreview(doctor.image || '')
      setErrors({})
    }
  }, [doctor])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('address.')) {
      const key = name.split('.')[1]
      setForm(prev => ({ ...prev, address: { ...prev.address, [key]: value } }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    setForm(prev => ({ ...prev, image: file || null }))
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(doctor?.image || '')
    }
  }

  const validate = () => {
    const next = {}
    if (!form.name) next.name = 'Name is required'
    if (!form.speciality) next.speciality = 'Speciality is required'
    if (!form.degree) next.degree = 'Degree is required'
    if (!form.experience) next.experience = 'Experience is required'
    if (form.fees === '' || isNaN(Number(form.fees))) next.fees = 'Fees must be a number'
    if (!form.about) next.about = 'About is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('speciality', form.speciality)
    fd.append('degree', form.degree)
    fd.append('experience', form.experience)
    fd.append('fees', String(form.fees))
    fd.append('about', form.about)
    fd.append('address', JSON.stringify(form.address))
    if (form.image) fd.append('image', form.image)
    onSubmit(fd)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Doctor</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className={fieldClass} />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Speciality</label>
            <input name="speciality" value={form.speciality} onChange={handleChange} className={fieldClass} />
            {errors.speciality && <p className="text-xs text-red-600 mt-1">{errors.speciality}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Degree</label>
            <input name="degree" value={form.degree} onChange={handleChange} className={fieldClass} />
            {errors.degree && <p className="text-xs text-red-600 mt-1">{errors.degree}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Experience</label>
            <input name="experience" value={form.experience} onChange={handleChange} className={fieldClass} />
            {errors.experience && <p className="text-xs text-red-600 mt-1">{errors.experience}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Fees</label>
            <input name="fees" value={form.fees} onChange={handleChange} className={fieldClass} />
            {errors.fees && <p className="text-xs text-red-600 mt-1">{errors.fees}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">About</label>
            <textarea name="about" value={form.about} onChange={handleChange} className={fieldClass} rows={3} />
            {errors.about && <p className="text-xs text-red-600 mt-1">{errors.about}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Address Line 1</label>
            <input name="address.line1" value={form.address.line1} onChange={handleChange} className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm mb-1">Address Line 2</label>
            <input name="address.line2" value={form.address.line2} onChange={handleChange} className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm mb-1">City</label>
            <input name="address.city" value={form.address.city} onChange={handleChange} className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm mb-1">State</label>
            <input name="address.state" value={form.address.state} onChange={handleChange} className={fieldClass} />
          </div>
          <div>
            <label className="block text-sm mb-1">ZIP</label>
            <input name="address.zip" value={form.address.zip} onChange={handleChange} className={fieldClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">Photo</label>
            <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm" />
          </div>
          <div className="flex items-center gap-3">
            {preview && <img src={preview} alt="preview" className="w-16 h-16 rounded-full object-cover ring-1 ring-gray-200" />}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" className="px-4 py-2 border rounded-md" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-60" disabled={submitting}>{submitting ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default EditDoctorModal


