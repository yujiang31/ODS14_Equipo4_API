import express from "express";
import fs from "fs";
import {PORT, SECRET_JWT_KEY} from './config.js'
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bodyParser from "body-parser";

//Importamos las rutas
import indicesbioRoutes from "./routes/indicesbio.js";
import nutrientesRoutes from "./routes/nutrientes_2.js";
import elementoFisicoquimicosRoutes from "./routes/elementosFisicoquimicos.js";
import homeRoutes from "./routes/home.js";




const app = express();

app.use(bodyParser.json());
import path from "path";
app.use(express.static(path.join(process.cwd(), "public")));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(cookieParser())




app.use("/indicesbio", indicesbioRoutes);
app.use("/nutrientes_2", nutrientesRoutes);
app.use("/elementosFisicoquimicos", elementoFisicoquimicosRoutes);
app.use("/", homeRoutes);






//Funcion para escuchar
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
