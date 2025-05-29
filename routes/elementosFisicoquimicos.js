import express from "express";
import fs from "fs";   
import path from "path";

const router = express.Router();

// Leer datos de manera asíncrona
const readData = async () => {
    try {
        return await fs.promises.readFile("./db/Elementos_Fisioquimicos_Generales.json", "utf8");
    } catch (error) {
        console.error("Error al leer el archivo JSON:", error);
        return "[]"; // Retorna un JSON vacío válido
    }
};


// Ruta principal
router.get("/", async (req, res) => {
    const rawData = await readData();
    res.render("elementosFisicoquimicos", { figJson: rawData });
});

// Ruta para obtener datos en formato JSON procesado
router.get("/datos-json", async (req, res) => {
    try {
        const rawData = await readData();
        const parsedData = JSON.parse(rawData);

        // 🔹 Filtrar solo los datos de temperatura correctamente
        const temperaturaData = parsedData.filter(item => 
            (item["Variable"] === "Temperatura aigua (CTD)" || 
            item["Variable"] === "Temperatura aigua (mostra)") &&
            item["Profunditat mostra (m)"]
        );

        const temperaturaPorAnoProfundidad = {};

        temperaturaData.forEach(item => {
            const year = item["Data"].substring(0, 4);
            const profundidad = Math.floor(parseFloat(item["Profunditat mostra (m)"])); // 🔹 Convertir profundidad a entero
            const valor = Math.round(parseFloat(item["Valor"].replace(',', '.'))); // 🔹 Convertir temperatura a entero

            if (!temperaturaPorAnoProfundidad[year]) temperaturaPorAnoProfundidad[year] = {};
            if (!temperaturaPorAnoProfundidad[year][profundidad]) temperaturaPorAnoProfundidad[year][profundidad] = [];

            temperaturaPorAnoProfundidad[year][profundidad].push(valor);
        });

        const temperaturaMediaPorAnoProfundidad = {};
        Object.keys(temperaturaPorAnoProfundidad).forEach(year => {
            temperaturaMediaPorAnoProfundidad[year] = {};
            Object.keys(temperaturaPorAnoProfundidad[year]).forEach(profundidad => {
                const valores = temperaturaPorAnoProfundidad[year][profundidad];
                temperaturaMediaPorAnoProfundidad[year][profundidad] = Math.round(valores.reduce((sum, val) => sum + val, 0) / valores.length);
            });
        });

        // 🔹 Obtener el año más reciente y el más antiguo
        const añosOrdenados = Object.keys(temperaturaMediaPorAnoProfundidad).sort((a, b) => b - a);
        const añoMasReciente = añosOrdenados[0];
        const añoMasAntiguo = añosOrdenados[añosOrdenados.length - 1];

        res.json({
            añoMasReciente: {
                año: añoMasReciente,
                datos: temperaturaMediaPorAnoProfundidad[añoMasReciente]
            },
            añoMasAntiguo: {
                año: añoMasAntiguo,
                datos: temperaturaMediaPorAnoProfundidad[añoMasAntiguo]
            }
        });
    } catch (error) {
        console.error("Error al procesar el JSON:", error);
        res.status(500).json({ error: "Error procesando los datos" });
    }
});






export default router;
