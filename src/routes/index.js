import { Router } from 'express'
import apiUsuarios from './api/usuarios.js'
import viewsHome from './views/home.js'
import viewsUsuarios from './views/usuarios.js'

const router = Router()

//API — retornam JSON
router.use('/api/usuarios', apiUsuarios)

// views — retornam HTML
router.use('/', viewsHome)
router.use('/', viewsUsuarios)

export default router