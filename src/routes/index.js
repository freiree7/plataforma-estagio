import { Router } from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import apiUsuarios, { perfilRouter } from './api/usuarios.js'
import apiVagas from './api/vagas.js'
import apiCandidaturas from './api/candidaturas.js'
import viewsHome from './views/home.js'
import viewsUsuarios from './views/usuarios.js'
import viewsPerfil from './views/perfil_usuario.js'
import viewsEmpresa from './views/empresas.js'
import auth from '../middlewares/auth.js'

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// api — retornam JSON
router.use('/api/usuarios', apiUsuarios)
router.use('/api', perfilRouter)
router.use('/api/vagas', apiVagas)
router.use('/api/candidaturas', apiCandidaturas)

// views — retornam HTML
router.get('/criar-vaga', auth('empresa'), (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../view/criar-vaga.html'))
})

router.get('/editar-vaga/:id', auth('empresa'), (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../view/editar-vaga.html'))
})

router.get('/vagas/:id/candidatos', auth('empresa'), (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../view/candidatos.html'))
})

router.get('/vagas/:id', auth('aluno'), (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../view/detalhe-vaga.html'))
})

router.get('/minhas-candidaturas', auth('aluno'), (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../view/minhas-candidaturas.html'))
})

router.use('/', viewsHome)
router.use('/', viewsUsuarios)
router.use('/', viewsPerfil)
router.use('/', viewsEmpresa)


export default router