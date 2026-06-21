import { Router } from 'express'
import usuarioController from '../../controllers/usuarios.controller.js'
import PerfilController from '../../controllers/perfil.controller.js'
import EmpresaController from '../../controllers/empresa.controller.js'
import HabilidadesController from '../../controllers/habilidades.controller.js'
import auth from '../../middlewares/auth.js'
import upload from '../../middlewares/upload.js'

const router = Router()

router.post('/cadastro', usuarioController.create)
router.post('/login', usuarioController.login)
router.post('/logout', usuarioController.logout)

router.get('/perfil', auth('aluno'), PerfilController.getPerfil)
router.patch('/perfil', auth('aluno'), PerfilController.updatePerfil)
router.post('/perfil/foto', auth('aluno'), upload.single('foto'), PerfilController.updateFoto)

router.get('/empresa/perfil', auth('empresa'), EmpresaController.getPerfil)
router.patch('/empresa/perfil', auth('empresa'), EmpresaController.updatePerfil)
router.post('/empresa/perfil/logo', auth('empresa'), upload.single('foto'), EmpresaController.updateLogo)


export const perfilRouter = Router()
perfilRouter.get('/perfil/habilidades', auth('aluno'), PerfilController.getHabilidades)
perfilRouter.patch('/perfil/habilidades', auth('aluno'), PerfilController.updateHabilidades)
perfilRouter.get('/habilidades', auth(), HabilidadesController.listar)

export default router
