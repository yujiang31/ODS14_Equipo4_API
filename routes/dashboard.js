import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from "body-parser";

const router = express.Router();

const app = express()
app.use(bodyParser.json());
app.set('view engine','ejs');
app.set('views', './views');



router.get('/', async (req, res) => {
  try {
    const datos = await procesarJSON();
    res.render('dashboard', { datos });
  } catch (error) {
    console.error('Error procesando JSON:', error);
    res.status(500).send('Error al procesar los datos');
  }
});

function leerJSON(nombreArchivo) {
  const ruta = path.join(process.cwd(), 'data', nombreArchivo);
  if (!fs.existsSync(ruta)) throw new Error(`No existe el archivo ${ruta}`);
  return JSON.parse(fs.readFileSync(ruta, 'utf8'));
}

router.get('/', (req, res) => {
  try {
    const temperatura = leerJSON('temperatura.json');
    const ph = leerJSON('ph_tratamientos.json');
    const residuos = leerJSON('residuos.json');

    res.render('dashboard', { temperatura, ph, residuos });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error cargando datos del dashboard');
  }
});


export default router;