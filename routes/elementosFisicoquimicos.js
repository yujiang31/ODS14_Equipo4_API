import express from "express";
import fs from "fs";   
import path from "path";

const router = express.Router();

// Función para leer datos del JSON
const readData = () => {
    try {
        return fs.readFileSync("./db/Elementos_Fisioquimicos_Generales.json", "utf8"); // Mantengo tu versión
    } catch (error) {
        console.error("Error al leer el archivo JSON:", error);
        return "[]"; // 🔹 Retorno un JSON vacío válido
    }
};

// Filtrar datos de pH y calcular medias
const calculatePhMedias = (data) => {
    try {
        const parsedData = JSON.parse(data); // 🔹 Parseamos el string a objeto JSON
        
        const phData = parsedData.filter(item => 
            item["Variable"] === "pH" &&
            item["Valor"] &&
            item["Profunditat mostra (m)"] &&
            item["Data"]
        );
        
        const grouped = {};
        phData.forEach(item => {
            const year = item["Data"].substring(0, 4);
            const profundidad = item["Profunditat mostra (m)"];
            const valor = parseFloat(item["Valor"].replace(',', '.'));

            if (!grouped[year]) grouped[year] = {};
            if (!grouped[year][profundidad]) grouped[year][profundidad] = [];

            grouped[year][profundidad].push(valor);
        });

        const medias = [];
        Object.keys(grouped).forEach(year => {
            Object.keys(grouped[year]).forEach(profundidad => {
                const valores = grouped[year][profundidad];
                const media = valores.reduce((a, b) => a + b, 0) / valores.length;
                medias.push({
                    year,
                    profundidad,
                    media: media.toFixed(3)
                });
            });
        });

        return medias;
    } catch (error) {
        console.error("Error al procesar los datos:", error);
        return []; // Retornar un array vacío si hay error
    }
};

// Ruta para renderizar la vista con los datos procesados
router.get("/", (req, res) => {
    const rawData = readData(); // 🔹 Usamos tu `readData` sin modificarlo
    const medias = calculatePhMedias(rawData); // 🔹 Parseamos los datos dentro de `calculatePhMedias`

    res.render("elementosFisicoquimicos", { medias });
});

export default router;
