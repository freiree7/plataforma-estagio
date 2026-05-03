import bcrypt from 'bcrypt'
import UsuarioModel from "../model/usuarios_model.js";



class usuarioController {
    static async create(req, res) {
        try {
            const { nome, email, senha, tipo, ra, cnpj } = req.body;
            const tiposValidos = ['aluno', 'empresa'];
            if (!nome || !email || !senha || !tipo || !tiposValidos.includes(tipo)) {
                return res.status(400).json({ erro: 'Erro no cliente' })
            }

            const raLimpo = typeof ra === 'string' ? ra.trim().toUpperCase() : ''
            const cnpjLimpo = typeof cnpj === 'string' ? cnpj.replace(/\D/g, '') : ''

            if (tipo === 'aluno' && !raLimpo) {
                return res.status(400).json({ erro: 'RA é obrigatório para aluno' })
            }

            if (tipo === 'empresa' && !cnpjLimpo) {
                return res.status(400).json({ erro: 'CNPJ é obrigatório para empresa' })
            }

            const usuarioSearchEmail = new UsuarioModel()
            const usuarioEmails = await usuarioSearchEmail.searchAllEmail(email)
            
            console.log(usuarioEmails)
            
            if (usuarioEmails.length > 0){
                
                return res.status(400).json({erro: 'Email já cadastrado'})
            }

            if (tipo === 'aluno') {
                const raCadastrado = await usuarioSearchEmail.searchRA(raLimpo)
                if (raCadastrado) {
                    return res.status(400).json({ erro: 'RA já cadastrado' })
                }
            }

            if (tipo === 'empresa') {
                const cnpjCadastrado = await usuarioSearchEmail.searchCNPJ(cnpjLimpo)
                if (cnpjCadastrado) {
                    return res.status(400).json({ erro: 'CNPJ já cadastrado' })
                }
            }



            //assincrona pois bcrypt.hash retorna uma promisse


            const senhaCrypt = await bcrypt.hash(senha.trim(), 10);

            //UsuarioModel deve ser inicializado com o new devido ser uma classe exportado do arquivo MODEL
            const usuarioModel = new UsuarioModel();
            
            //funcao para criar o usuario
            await usuarioModel.createUsuario({
                nome,
                email,
                senha: senhaCrypt,
                tipo,
                ra: tipo === 'aluno' ? raLimpo : null,
                cnpj: tipo === 'empresa' ? cnpjLimpo : null
            })

            return res.status(201).json({ msg: 'Usuario criado com sucesso' })


        } catch (error) {
            console.error(error)
            return res.status(500).json({ erro: 'Erro no servidor' })
        }

    }

    static async readAll(req, res) {
        try {
            const usuarios_readAll = new UsuarioModel();
            const usuarios = await usuarios_readAll.readAll()
            return res.status(200).json(usuarios)

        } catch (error) {
            console.error(error)
            return res.status(500).json({ erro: 'Erro com o servidor' })
        }
    }

    static async login(req, res) {
        try {
            const body = req.body && typeof req.body === 'object' ? req.body : {}
            const identificador = String(
                body.identificador ?? body.email ?? body.cnpj ?? body.ra ?? ''
            ).trim()
            const senha = String(body.senha ?? '')

            if (!identificador || !senha.trim()) {
                return res.status(400).json({ erro: 'Campos obrigatórios' })
            }

            const usuarioSearchEmail = new UsuarioModel()
            const usuariosCandidatos = await usuarioSearchEmail.searchByIdentifier(identificador)
            
            if (!usuariosCandidatos || usuariosCandidatos.length === 0) {
                return res.status(401).json({ erro: 'Usuário não encontrado para o identificador informado' })
            }


            let usuarioLogin = null
            for (const candidato of usuariosCandidatos) {
                const senhaValida = await bcrypt.compare(
                    senha.trim(),
                    candidato.senha
                )
                if (senhaValida) {
                    usuarioLogin = candidato
                    break
                }
            }

            if (!usuarioLogin) {
                return res.status(401).json({ erro: 'Senha inválida para o identificador informado' })
            }

            // nunca retornar a senha
            delete usuarioLogin.senha

            return res.json({ msg: 'Login concluído', usuario: usuarioLogin })

        } catch (error) {
            console.error(error)
            return res.status(500).json({ erro: 'Erro no servidor' })
        }
    }


}

export default usuarioController;