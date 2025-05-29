import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from "body-parser";

const router = express.Router();

const app = express()
app.use(bodyParser.json());
app.set('view engine','ejs');
app.set('views', './views');

function leerJSON(nombreArchivo) {
  const ruta = path.join(process.cwd(), 'db', nombreArchivo);
  if (!fs.existsSync(ruta)) {
    throw new Error(`No existe el archivo ${ruta}`);
  }
  const contenido = fs.readFileSync(ruta, 'utf8');
  return JSON.parse(contenido);
}

router.get('/', (req, res) => {
  try {
    // Leer los archivos JSON
    const elementos = leerJSON('Elementos_Fisioquimicos_Generales.json');
    const comarques = leerJSON('comarques_masses.json');
    const tratamientos = leerJSON('Estacions_regen_aigua.json');
    const residuos = leerJSON('residus_municipals.json');

    // Preparar datos
    const comarquesMap = {};
    for (const [comarca, masas] of Object.entries(comarques)) {
      masas.forEach(massa => {
        comarquesMap[massa.trim()] = comarca;
      });
    }

    // --- Temperatura ---
    const tempData = elementos.filter(d => d.Variable === 'Temperatura aigua (mostra)').map(d => {
      let valor = parseFloat(String(d.Valor).replace(',', '.'));
      const comarca = comarquesMap[d['Massa d\'aigua']];
      return (valor && comarca) ? { Valor: valor, Comarca: comarca } : null;
    }).filter(Boolean);

    // --- pH ---
    const phRaw = elementos.filter(d => d.Variable === 'pH').map(d => {
      let valor = parseFloat(String(d.Valor).replace(',', '.'));
      const comarca = comarquesMap[d['Massa d\'aigua']];
      return (valor && comarca) ? { Valor: valor, Comarca: comarca } : null;
    }).filter(Boolean);

    const phPorComarca = {};
    phRaw.forEach(d => {
      if (!phPorComarca[d.Comarca]) phPorComarca[d.Comarca] = [];
      phPorComarca[d.Comarca].push(d.Valor);
    });

    const avgPh = Object.entries(phPorComarca).map(([comarca, valores]) => ({
      Comarca: comarca,
      Valor: valores.reduce((a, b) => a + b, 0) / valores.length
    }));

    const comarcasCosteras = [
      'Alt Empordà', 'Baix Empordà', 'La Selva', 'Maresme', 'Barcelonès',
      'Baix Llobregat', 'Garraf', 'Baix Penedès', 'Tarragonès',
      'Baix Camp', 'Baix Ebre', 'Montsià'
    ];

    const tratamientosMap = {};
    tratamientos.forEach(row => {
      const comarca = row.Comarca?.trim();
      if (comarcasCosteras.includes(comarca)) {
        const tratamientosStr = Object.entries(row)
          .filter(([k]) => k.includes('Tractament'))
          .map(([, v]) => String(v).trim())
          .filter(v => v)
          .join(', ');
        tratamientosMap[comarca] = Array.from(new Set(tratamientosStr.split(', '))).join(', ');
      }
    });

    const phFinal = avgPh.filter(d => comarcasCosteras.includes(d.Comarca)).map(d => ({
      ...d,
      Tratamientos: tratamientosMap[d.Comarca] || ''
    })).sort((a, b) => b.Valor - a.Valor);

    // --- Residuos ---
    const residuosParsed = residuos
      .filter(r => r['Kg / hab / any'])
      .map(r => ({
        Comarca: r.Comarca?.trim(),
        'Kg / hab / any': parseFloat(r['Kg / hab / any'])
      }))
      .filter(r => comarcasCosteras.includes(r.Comarca));

    const residuosMap = {};
    residuosParsed.forEach(d => {
      if (!residuosMap[d.Comarca]) residuosMap[d.Comarca] = [];
      residuosMap[d.Comarca].push(d['Kg / hab / any']);
    });

    const residuosFinal = Object.entries(residuosMap).map(([comarca, valores]) => ({
      Comarca: comarca,
      'Kg / hab / any': valores.sort((a, b) => a - b)[Math.floor(valores.length / 2)] // mediana simple
    }));

    // Renderizar
    res.render('dashboard', {
      temperatura: tempData,
      ph: phFinal,
      residuos: residuosFinal
    });

  } catch (error) {
    console.error('Error cargando datos del dashboard:', error);
    res.status(500).send('Error cargando datos del dashboard');
  }
});



export default router;