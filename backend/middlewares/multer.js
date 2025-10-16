import multer from 'multer'
import fs from 'fs'
import path from 'path'

const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
    try{ fs.mkdirSync(uploadDir, { recursive: true }) } catch { /* ignore */ }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function(req,file,callback){
        const unique = Date.now() + '-' + Math.round(Math.random()*1e9)
        const ext = path.extname(file.originalname || '')
        callback(null, unique + ext)
    }
})

const upload = multer({storage})

export default upload