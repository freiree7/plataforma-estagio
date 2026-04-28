import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import routerUsuarios from '../routes/usuarios_routes.js'

const app = express()


//middlewares aqui

app.use(express.json())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


app.use(express.static('public'))
app.use(express.static('js'))
app.use(express.urlencoded({ extended: true })); 


app.use(express.static(path.join(__dirname, 'public')))



//rotas aqui

app.use(routerUsuarios) 



export default app