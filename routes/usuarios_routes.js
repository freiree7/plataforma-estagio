import { Router } from "express";
import path from 'path';
import usuarioController from "../controller/usuarios_controller.js"
const routerUsuarios = Router()

routerUsuarios.get('/cadastro', (req,res) =>{
    res.sendFile(path.resolve('view/cadastro.html'))
});

routerUsuarios.get('/login',(req,res) =>{
    res.sendFile(path.resolve('view/login.html'))
})

routerUsuarios.get('/home' , (req,res) =>{
    res.sendFile(path.resolve('view/home.html'))
})


routerUsuarios.post('/cadastro',usuarioController.create)

routerUsuarios.post('/login' , usuarioController.login )
    

export default routerUsuarios;