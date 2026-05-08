import 'dotenv/config'
import app from './config/express.js'
import './database/mysql.js'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`)
    console.log(`http://localhost:${PORT}/cadastro`)
     console.log(`http://localhost:${PORT}/login`)
})