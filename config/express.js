import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'    
import { fileURLToPath } from 'url'
import router from '../src/routes/index.js'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// middlewares globais
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../public')))
app.use(cookieParser())

// rotas
app.use(router)

export default app