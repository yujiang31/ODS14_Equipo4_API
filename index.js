import express from "express";
import fs from "fs";
import {PORT, SECRET_JWT_KEY} from './config.js'
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bodyParser from "body-parser";

//Importamos las rutas
import indicesbioRoutes from "./routes/indicesbio.js";
import nutrientesRoutes from "./routes/nutrientes_2.js";
import elementoFisicoquimicosRoutes from "./routes/elementoFisicoquimicos.js";
import homeRoutes from "./routes/home.js";




const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(cookieParser())


app.use((req, res, next) => {
    const token = req.cookies.access_token;
    req.session = { user: null };
    try {
        const data = jwt.verify(token, SECRET_JWT_KEY);
        req.session.user = data;
        console.log("Token válido:", data);
    } catch (error) {
        console.error("Token inválido o no proporcionado:", error.message);
        req.session.user = null;
    }
    next(); // seguir a la siguiente ruta o middleware.
});

app.use("/indicesbio", indicesbioRoutes);
app.use("/nutrientes_2", nutrientesRoutes);
app.use("/elementosFisicoquimicos", elementoFisicoquimicosRoutes);
app.use("/", homeRoutes);






//Funcion para escuchar
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
