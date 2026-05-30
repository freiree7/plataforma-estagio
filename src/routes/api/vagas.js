import { Router } from 'express'
import VagasController from '../../controllers/vagas.controller.js'
import auth, { authOpcional } from '../../middlewares/auth.js'

const router = Router()

router.get('/empresa/minhas', auth('empresa'), VagasController.listarPorEmpresa)

router.get('/', authOpcional(), VagasController.listarAtivas)
router.get('/:id', VagasController.buscarPorId)

router.post('/', auth('empresa'), VagasController.criar)
router.put('/:id', auth('empresa'), VagasController.editar)
router.delete('/:id', auth('empresa'), VagasController.deletar)

export default router
