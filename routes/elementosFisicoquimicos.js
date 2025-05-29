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

router.get("/datos-json", async (req, res) => {
    try {
        const rawData = await readData();
        const parsedData = JSON.parse(rawData);

        if (!parsedData || parsedData.length === 0) {
            console.error("Error: JSON vacío o datos no cargados.");
            res.json({ error: "No se encontraron datos en el JSON." });
            return;
        }

        console.log("🔹 JSON original recibido:", parsedData);

        // 🔹 Filtrar registros con "Temperatura aigua (mostra)" y "Temperatura aigua (CTD)"
        const temperaturaData = parsedData.filter(item => 
            item["Variable"] === "Temperatura aigua (mostra)" || 
            item["Variable"] === "Temperatura aigua (CTD)"
        );

        if (temperaturaData.length === 0) {
            console.error("⚠️ No hay registros de 'Temperatura aigua (mostra)' ni 'Temperatura aigua (CTD)' en el JSON.");
            res.json({ error: "No hay datos de temperatura disponibles." });
            return;
        }

        console.log("🔹 Datos filtrados correctamente:", temperaturaData);

        const temperaturaPorMasaAgua = {};

        temperaturaData.forEach(item => {
            const masaAgua = item["Massa d'aigua"];
            const year = item["Data"].substring(0, 4);
            const valor = parseFloat(item["Valor"].replace(',', '.'));

            if (!masaAgua || !year || isNaN(valor)) {
                console.warn(`⚠️ Registro ignorado:`, item);
                return;
            }

            if (!temperaturaPorMasaAgua[masaAgua]) temperaturaPorMasaAgua[masaAgua] = {};
            if (!temperaturaPorMasaAgua[masaAgua][year]) temperaturaPorMasaAgua[masaAgua][year] = [];
            temperaturaPorMasaAgua[masaAgua][year].push(valor);
        });

        console.log("🔹 Datos agrupados por masa de agua:", temperaturaPorMasaAgua);

        // 🔹 Calcular la temperatura media por año y por masa de agua
        const temperaturaMediaPorMasaAgua = {};
        Object.keys(temperaturaPorMasaAgua).forEach(masaAgua => {
            temperaturaMediaPorMasaAgua[masaAgua] = {};
            Object.keys(temperaturaPorMasaAgua[masaAgua]).forEach(year => {
                const valores = temperaturaPorMasaAgua[masaAgua][year];
                temperaturaMediaPorMasaAgua[masaAgua][year] = (valores.reduce((sum, val) => sum + val, 0) / valores.length).toFixed(2);
            });
        });

        console.log("🔹 JSON final procesado:", temperaturaMediaPorMasaAgua);
        res.json({ temperaturaMediaPorMasaAgua });
    } catch (error) {
        console.error("⚠️ Error al procesar el JSON:", error);
        res.status(500).json({ error: "Error procesando los datos" });
    }
});



router.get("/datos-transparencia", async (req, res) => {
    try {
        const rawData = await readData();
        const parsedData = JSON.parse(rawData);

        if (!parsedData || parsedData.length === 0) {
            console.error("Error: JSON vacío o datos no cargados.");
            res.json({ error: "No se encontraron datos en el JSON." });
            return;
        }

        console.log("🔹 JSON original recibido:", parsedData);

        // 🔹 Busca registros con "Transparència (disc de Secchi)"
        const transparenciaData = parsedData.filter(item => 
            item["Variable"] === "Transparència (disc de Secchi)"
        );

        if (transparenciaData.length === 0) {
            console.error("⚠️ No hay registros de 'Transparència (disc de Secchi)' en el JSON.");
            res.json({ error: "No hay datos de transparencia disponibles." });
            return;
        }

        console.log("🔹 Datos filtrados correctamente:", transparenciaData);

        const transparenciaPorMasaAgua = {};

        transparenciaData.forEach(item => {
            const masaAgua = item["Massa d'aigua"];
            const año = item["Data"].substring(0, 4);
            const valor = parseFloat(item["Valor"].replace(",", "."));

            if (!masaAgua || !año || isNaN(valor)) {
                console.warn(`⚠️ Registro ignorado:`, item);
                return;
            }

            if (!transparenciaPorMasaAgua[masaAgua]) transparenciaPorMasaAgua[masaAgua] = {};
            if (!transparenciaPorMasaAgua[masaAgua][año]) transparenciaPorMasaAgua[masaAgua][año] = [];
            transparenciaPorMasaAgua[masaAgua][año].push(valor);
        });

        console.log("🔹 Datos agrupados por masa d’aigua:", transparenciaPorMasaAgua);

        // 🔹 Calcular la transparencia media por año en cada masa d’aigua
        const transparenciaMediaPorMasaAgua = {};
        Object.keys(transparenciaPorMasaAgua).forEach(masaAgua => {
            transparenciaMediaPorMasaAgua[masaAgua] = {};
            Object.keys(transparenciaPorMasaAgua[masaAgua]).forEach(año => {
                const valores = transparenciaPorMasaAgua[masaAgua][año];
                transparenciaMediaPorMasaAgua[masaAgua][año] = (
                    valores.reduce((sum, val) => sum + val, 0) / valores.length
                ).toFixed(2);
            });
        });

        console.log("🔹 JSON final procesado:", transparenciaMediaPorMasaAgua);
        res.json({ transparenciaMediaPorMasaAgua });

    } catch (error) {
        console.error("⚠️ Error al procesar el JSON:", error);
        res.status(500).json({ error: "Error procesando los datos" });
    }


});

router.get("/datos-ph-mapa", async (req, res) => {
    try {
        const rawData = await readData();
        const parsedData = JSON.parse(rawData);

        if (!parsedData || parsedData.length === 0) {
            res.json({ error: "No se encontraron datos en el JSON." });
            return;
        }

        const phMedioPorMasaAgua = {};

        parsedData.forEach(item => {
            if (!item["Variable"].includes("pH")) return;

            const masaAgua = item["Massa d'aigua"];
            const año = item["Data"].substring(0, 4);
            const valor = parseFloat(item["Valor"].replace(",", "."));
            const coordenadas = { x: item["UTM X"], y: item["UTM Y"] };

            if (!masaAgua || !año || isNaN(valor) || !coordenadas.x || !coordenadas.y) return;

            if (!phMedioPorMasaAgua[masaAgua]) phMedioPorMasaAgua[masaAgua] = {};
            if (!phMedioPorMasaAgua[masaAgua][año]) phMedioPorMasaAgua[masaAgua][año] = { valores: [], coordenadas };

            phMedioPorMasaAgua[masaAgua][año].valores.push(valor);
        });

        Object.keys(phMedioPorMasaAgua).forEach(masaAgua => {
            Object.keys(phMedioPorMasaAgua[masaAgua]).forEach(año => {
                const valores = phMedioPorMasaAgua[masaAgua][año].valores;
                phMedioPorMasaAgua[masaAgua][año] = {
                    phMedio: (valores.reduce((sum, val) => sum + val, 0) / valores.length).toFixed(2),
                    coordenadas: phMedioPorMasaAgua[masaAgua][año].coordenadas
                };
            });
        });

        res.json({ phMedioPorMasaAgua });

    } catch (error) {
        console.error("⚠️ Error procesando los datos:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});










export default router;
