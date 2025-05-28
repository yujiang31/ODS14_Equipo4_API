import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from "body-parser";

const router = express.Router();

const app = express()
app.use(bodyParser.json());
app.set('view engine','ejs');
app.set('views', './views');

const rangos_sanos = {
  'Fosfats': [0.05, 0.5],
  'Nitrats': [0.5, 5.0],
  'Silicats': [1.5, 10.0]
};

const procesarJSON = () => {
  return new Promise((resolve, reject) => {
    // Ruta al JSON dentro de /db
    const filePath = path.resolve('db', 'nutrientes_2.json');
    fs.readFile(filePath, 'utf8', (err, raw) => {
      if (err) return reject(err);
      try {
        const resultados = JSON.parse(raw);

        // --- Preprocesamiento ---
        const datosProcesados = resultados
          .map(item => {
            const valor = parseFloat(String(item.Valor).replace(',', '.'));
            const fecha = new Date(item.Data);
            const anyo = fecha.getFullYear();
            const variable = item.Variable;
            const categoria = variable.split('(')[0].trim();
            return {
              ...item,
              Valor: valor,
              Data: fecha,
              Any: anyo,
              Categoria: categoria
            };
          })
          .filter(item =>
            !isNaN(item.Valor) &&
            item.Data.toString() !== 'Invalid Date' &&
            item.Variable.includes('(aigua de mar)')
          );

        // --- Agrupación y medias anuales ---
        const agrupados = {};
        datosProcesados.forEach(item => {
          const key = `${item.Any}-${item.Categoria}`;
          if (!agrupados[key]) {
            agrupados[key] = { Any: item.Any, Categoria: item.Categoria, Valores: [] };
          }
          agrupados[key].Valores.push(item.Valor);
        });

        const promedios = Object.values(agrupados).map(grupo => {
          const suma = grupo.Valores.reduce((a, b) => a + b, 0);
          return {
            Any: grupo.Any,
            Categoria: grupo.Categoria,
            Promedio: suma / grupo.Valores.length
          };
        });

        resolve(promedios);
      } catch (e) {
        reject(e);
      }
    });
  });
};

router.get('/', async (req, res) => {
  try {
    const datos = await procesarJSON();
    res.render('nutrientes_2', { datos });
  } catch (error) {
    console.error('Error procesando JSON:', error);
    res.status(500).send('Error al procesar los datos');
  }
});

export default router;
