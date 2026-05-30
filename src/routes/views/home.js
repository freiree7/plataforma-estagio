import { Router } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import auth from '../../middlewares/auth.js'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.get('/home/aluno' , auth('aluno'), (req,res) =>{
    res.sendFile(path.resolve(__dirname,'../../../view/home_aluno.html' ))
})

router.get('/home/empresa' , auth('empresa'), (req,res) =>{
    res.sendFile(path.resolve(__dirname,'../../../view/home_empresa.html' ))
})

router.get('/vagas/:id/candidatos', auth('empresa'), (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../../view/candidatos.html'))
})

export default router