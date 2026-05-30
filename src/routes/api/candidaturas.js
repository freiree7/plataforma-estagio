import { Router } from 'express'
import CandidaturasController from '../../controllers/candidaturas.controller.js'
import auth from '../../middlewares/auth.js'

const router = Router()

router.post('/', auth('aluno'), CandidaturasController.candidatar)
router.get('/minhas', auth('aluno'), CandidaturasController.listarMinhasCandidaturas)
router.get('/vaga/:vagaId', auth('empresa'), CandidaturasController.listarCandidatos)
router.patch('/:id/status', auth('empresa'), CandidaturasController.atualizarStatus)

export default router
