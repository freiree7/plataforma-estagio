import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// garante que a pasta existe
const uploadDir = path.resolve(__dirname, '../../public/uploads')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        // nome único: usuario_id + timestamp + extensão original
        const ext = path.extname(file.originalname).toLowerCase()
        const nome = `perfil_${req.usuario.id}_${Date.now()}${ext}`
        cb(null, nome)
    }
})

const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.'), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 } // 3mb máximo
})

export default upload
