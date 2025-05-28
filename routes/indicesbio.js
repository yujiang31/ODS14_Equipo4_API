import express from "express";
import fs from "fs";   

 

const router = express.Router();

//Función para leer el archivo JSON

const readData = () => {
    try {
      const raw = fs.readFileSync("./db/indices-biologicos.json", "utf8");
      return JSON.parse(raw);
    } catch (error) {
      console.error("Error al leer el archivo JSON:", error);
      return [];
    }
  };
  

// Función para filtrar y calcular promedios para el año 2024
const calcularClorofila2024 = (data) => {
    // Parseo de fechas y valores
    const data2024 = data
      .filter(item => item["Variable"] === "Clorofil·la a" && item["Valor"] && item["Data"] && item["Codi Estació"])
      .map(item => ({
        ...item,
        Data: new Date(item["Data"].replace(/\//g, "-")),
        Valor: parseFloat(item["Valor"])
      }))
      .filter(item => item.Data.getFullYear() === 2024 && !isNaN(item.Valor));
  
    // Agrupar por estación
    const agrupado = {};
    data2024.forEach(item => {
      const est = item["Codi Estació"];
      if (!agrupado[est]) agrupado[est] = { "Codi Estació": est, "UTM X": [], "UTM Y": [], "Valor": [] };
      agrupado[est]["UTM X"].push(item["UTM X"]);
      agrupado[est]["UTM Y"].push(item["UTM Y"]);
      agrupado[est]["Valor"].push(item["Valor"]);
    });
  
    // Calcular promedio
    const promedio = arr => arr.reduce((s,v) => s+v, 0) / arr.length;
    return Object.values(agrupado).map(est => ({
      "Codi Estació": est["Codi Estació"],
      "UTM X": promedio(est["UTM X"]),
      "UTM Y": promedio(est["UTM Y"]),
      "Valor": promedio(est["Valor"])
    }));
  };
  


// Ruta GET limpia y clara
router.get("/", (req, res) => {
    const data = readData();
    const clorofila2024 = calcularClorofila2024(data);
    console.log("Clorofila en 2024:", clorofila2024.length);
    res.render("indicesbio", { clorofila: clorofila2024 });
  });

export default router;
