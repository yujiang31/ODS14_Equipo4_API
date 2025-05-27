import express from "express";
import fs from "fs";   

 

const router = express.Router();

// 🔹 Función para leer el archivo JSON

const readData = () => {
    try {
      const raw = fs.readFileSync("./db/indices-biologicos.json", "utf8");
      return JSON.parse(raw);
    } catch (error) {
      console.error("Error al leer el archivo JSON:", error);
      return [];
    }
  };
  

// 🔹 Función para filtrar y calcular promedios para el año 2024
const calcularEstacionesPromedio = (data) => {
    const data2024 = data
        .filter(item => item["Data"] && item["Valor"] && item["Codi Estació"])
        .map(item => {
            const parsedDate = new Date(item["Data"].replace(/\//g, "-"));
            const valorNum = parseFloat(item["Valor"]);
            return {
                ...item,
                Valor: isNaN(valorNum) ? null : valorNum,
                Data: parsedDate,
            };
        })
        .filter(item => item.Data.getFullYear() === 2024 && item.Valor !== null);

    const agrupado = {};
    data2024.forEach(item => {
        const est = item["Codi Estació"];
        if (!agrupado[est]) {
            agrupado[est] = {
                "Codi Estació": est,
                "UTM X": [],
                "UTM Y": [],
                "Valor": [],
            };
        }
        agrupado[est]["UTM X"].push(item["UTM X"]);
        agrupado[est]["UTM Y"].push(item["UTM Y"]);
        agrupado[est]["Valor"].push(item["Valor"]);
    });

    const promedio = arr => arr.reduce((sum, v) => sum + v, 0) / arr.length;

    return Object.values(agrupado).map(est => ({
        "Codi Estació": est["Codi Estació"],
        "UTM X": promedio(est["UTM X"]),
        "UTM Y": promedio(est["UTM Y"]),
        "Valor": promedio(est["Valor"])
    }));
};

// 🔹 Ruta GET limpia y clara
router.get("/", (req, res) => {
    const data = readData();
    console.log("Datos leídos:", data.length || data); 
    const procesado = calcularEstacionesPromedio(data);
    console.log("Datos procesados:", procesado.length || procesado);
    res.render("indicesbio", {procesado});
});

export default router;
