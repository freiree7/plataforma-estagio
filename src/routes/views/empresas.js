import { Router } from "express";   
import path from 'path';
import { fileURLToPath } from "url";

const router = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.get("/empresas" , (req,res) =>{

    res.sendFile(path.resolve(__dirname,'../../../view/empresas.html' ))

})
export default router;