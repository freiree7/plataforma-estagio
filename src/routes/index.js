import { Router } from 'express'
import apiUsuarios from './api/usuarios.js'
import viewsHome from './views/home.js'
import viewsUsuarios from './views/usuarios.js'
import viewsPerfil from './views/perfil_usuario.js'
import viewsEmpresa from './views/empresas.js'

const router = Router()

//API — retornam JSON
router.use('/api/usuarios', apiUsuarios)

// views — retornam HTML
router.use('/', viewsHome)
router.use('/', viewsUsuarios)
router.use('/', viewsPerfil)
router.use('/', viewsEmpresa)


export default router