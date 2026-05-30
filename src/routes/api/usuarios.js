import { Router } from 'express'
import usuarioController from '../../controllers/usuarios.controller.js'
import PerfilController from '../../controllers/perfil.controller.js'
import HabilidadesController from '../../controllers/habilidades.controller.js'
import auth from '../../middlewares/auth.js'

const router = Router()

router.post('/cadastro', usuarioController.create)
router.post('/login', usuarioController.login)
router.post('/logout', usuarioController.logout)

router.get('/perfil', auth('aluno'), PerfilController.getPerfil)
router.patch('/perfil', auth('aluno'), PerfilController.updatePerfil)

export const perfilRouter = Router()
perfilRouter.get('/perfil/habilidades', auth('aluno'), PerfilController.getHabilidades)
perfilRouter.patch('/perfil/habilidades', auth('aluno'), PerfilController.updateHabilidades)
perfilRouter.get('/habilidades', auth(), HabilidadesController.listar)

export default router
