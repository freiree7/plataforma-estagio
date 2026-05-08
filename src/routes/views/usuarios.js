import { Router } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.get('/cadastro', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../../view/cadastro.html'))
})

router.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../../view/login.html'))
})

export default router