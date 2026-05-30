import { Router } from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import auth from '../../middlewares/auth.js'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.get('/perfil', (req, res) => {
    res.redirect('/perfil/aluno')
})

router.get('/perfil/aluno', auth('aluno'), (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../../view/perfil.html'))
})

export default router
