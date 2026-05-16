import jwt from 'jsonwebtoken'

const auth = (tipoPermitido) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization
            const tokenHeader = authHeader?.split(' ')[1]
            const tokenCookie = req.cookies?.token
            const token = tokenHeader || tokenCookie

           
           // console.log('Cookie recebido:', req.cookies)
            //console.log('Token encontrado:', token ? 'sim' : 'não')
            //console.log('Tipo permitido:', tipoPermitido)

            if (!token) {
                console.log('Bloqueado: sem token')
                if (req.accepts('html')) return res.redirect('/login')
                return res.status(401).json({ erro: 'Token não informado' })
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            //console.log('Decoded:', decoded)

            if (tipoPermitido && decoded.tipo !== tipoPermitido) {
                console.log('Bloqueado: tipo incorreto', decoded.tipo, '!==', tipoPermitido)
                if (req.accepts('html')) 
                    return res.redirect('/login')

                return res.status(403).json({ erro: 'Acesso não permitido' })
            }

            req.usuario = decoded
            next()

        } catch (error) {
            console.log('Erro no auth:', error.message)
            if (req.accepts('html')) return res.redirect('/login')
            return res.status(401).json({ erro: 'Token inválido' })
        }
    }
}

export default auth