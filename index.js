import 'dotenv/config'
import app from './config/config-express.js'
import './database/mysql.js'

const PORT  = process.env.PORT

app.listen(PORT , () => {
  console.log('Servidor rodando na porta: ' , PORT)
  console.log('http://localhost:' + PORT + '/cadastro')
  
})

