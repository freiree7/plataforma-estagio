import { Router } from 'express'
import usuarioController from '../../controllers/usuarios.controller.js'

const router = Router()

router.post('/cadastro',usuarioController.create)

router.post('/login' , usuarioController.login )

// Protegidas — autenticação obrigatória (implementar depois)
//router.get('/perfil', auth('aluno'),   usuarioController.perfil)
//router.get('/dados',  auth('empresa'), usuarioController.dados)

export default router