import bcrypt from 'bcrypt'
import UsuarioModel from "../model/usuarios_model.js";
import UsuariosModel from '../model/usuarios_model.js';



class usuarioController {
    static async create(req, res) {
        try {
            const { nome, email, senha, tipo } = req.body;
            const tiposValidos = ['aluno', 'empresa'];
            if (!nome || !email || !senha || !tipo || !tiposValidos.includes(tipo)) {
                return res.status(400).json({ erro: 'Erro no cliente' })
            }
            const usuarioSearchEmail = new UsuarioModel()
            const usuarioEmails = await usuarioSearchEmail.searchAllEmail(email)
            
            console.log(usuarioEmails)
            
            if (usuarioEmails.length > 0){
                
                return res.status(400).json({erro: 'Email já cadastrado'})
            }



            //assincrona pois bcrypt.hash retorna uma promisse


            const senhaCrypt = await bcrypt.hash(senha.trim(), 10);

            //UsuarioModel deve ser inicializado com o new devido ser uma classe exportado do arquivo MODEL
            const usuarioModel = new UsuarioModel();
            
            //funcao para criar o usuario
            await usuarioModel.createUsuario({ nome, email, senha: senhaCrypt, tipo })

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
            const { email, senha } = req.body

            if (!email || !senha) {
                return res.status(400).json({ erro: 'Campos obrigatórios' })
            }

            const usuarioSearchEmail = new UsuarioModel()
            const usuarioLogin = await usuarioSearchEmail.searchEmail(email)
            
            if (!usuarioLogin) {
                return res.status(401).json({ erro: 'Email ou senha inválidos' })
            }


            //valida a senha digitada com a senha salva criptografada no database
            const senhaValida = await bcrypt.compare(
                senha.trim(),
                usuarioLogin.senha
                //essa linha retorna a senha salva no db
            )

            if (!senhaValida) {
                return res.status(401).json({ erro: 'Email ou senha inválidos' })
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