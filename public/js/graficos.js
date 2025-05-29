// Variables globales para gráficos
let graficoTemperatura = null;
let graficoTransparencia = null;

// Cargar datos al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarDatosTemperatura();
    cargarDatosTransparencia();
});

function cargarDatosTemperatura() {
    const masaAguaSelect = document.getElementById("masaAguaTemperatura");

    if (!masaAguaSelect) {
        console.error("Error: El select de temperatura no existe.");
        return;
    }

    fetch("/elementosFisicoquimicos/datos-json")
        .then(response => response.json())
        .then(data => {
            if (!data || !data.temperaturaMediaPorMasaAgua) {
                console.error("Error: Datos no disponibles.");
                return;
            }

            const masasAgua = Object.keys(data.temperaturaMediaPorMasaAgua);
            masasAgua.forEach(masa => {
                const option = document.createElement("option");
                option.value = masa;
                option.textContent = masa;
                masaAguaSelect.appendChild(option);
            });

            masaAguaSelect.value = masasAgua[0]; 
            actualizarGraficoTemperatura();
        })
        .catch(error => console.error("Error al cargar los datos:", error));
}

function actualizarGraficoTemperatura() {
    const masaAguaSeleccionada = document.getElementById("masaAguaTemperatura")?.value;

    if (!masaAguaSeleccionada) {
        console.error("Error: No se ha seleccionado una masa d’aigua.");
        return;
    }

    fetch("/elementosFisicoquimicos/datos-json")
        .then(response => response.json())
        .then(data => {
            const temperaturaPorAño = data.temperaturaMediaPorMasaAgua?.[masaAguaSeleccionada];

            if (!temperaturaPorAño) {
                console.error("No hay datos disponibles para la selección.");
                return;
            }

            const años = Object.keys(temperaturaPorAño);
            const valores = Object.values(temperaturaPorAño);

            const canvasContainer = document.getElementById("canvas-container-temperatura");
            canvasContainer.innerHTML = '<canvas id="grafico-temperatura" width="400" height="300"></canvas>';
            const canvas = document.getElementById("grafico-temperatura");
            const ctx = canvas.getContext("2d");

            if (graficoTemperatura) {
                graficoTemperatura.destroy();
            }

            graficoTemperatura = new Chart(ctx, {
                type: "line",
                data: {
                    labels: años,
                    datasets: [{
                        label: `Temperatura Media en ${masaAguaSeleccionada}`,
                        data: valores,
                        borderColor: "rgba(255,99,132,1)",
                        backgroundColor: "rgba(255,99,132,0.2)",
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: "Año" } },
                        y: { title: { display: true, text: "Temperatura Media (°C)" } }
                    }
                }
            });

        })
        .catch(error => console.error("Error al cargar los datos:", error));
}

// 🔹 Gráfico de transparencia
function cargarDatosTransparencia() {
    const masaAguaSelect = document.getElementById("masaAguaTransparencia");

    if (!masaAguaSelect) {
        console.error("Error: El select de transparencia no existe.");
        return;
    }

    fetch("/elementosFisicoquimicos/datos-transparencia")
        .then(response => response.json())
        .then(data => {
            if (!data || !data.transparenciaMediaPorMasaAgua) {
                console.error("Error: Datos no disponibles.");
                return;
            }

            const masasAgua = Object.keys(data.transparenciaMediaPorMasaAgua);
            masasAgua.forEach(masa => {
                const option = document.createElement("option");
                option.value = masa;
                option.textContent = masa;
                masaAguaSelect.appendChild(option);
            });

            masaAguaSelect.value = masasAgua[0]; 
            actualizarGraficoTransparencia();
        })
        .catch(error => console.error("Error al cargar los datos:", error));
}

function actualizarGraficoTransparencia() {
    const masaAguaSeleccionada = document.getElementById("masaAguaTransparencia")?.value;

    if (!masaAguaSeleccionada) {
        console.error("Error: No se ha seleccionado una masa d’aigua.");
        return;
    }

    fetch("/elementosFisicoquimicos/datos-transparencia")
        .then(response => response.json())
        .then(data => {
            const transparenciaPorAño = data.transparenciaMediaPorMasaAgua?.[masaAguaSeleccionada];

            if (!transparenciaPorAño || Object.keys(transparenciaPorAño).length === 0) {
                console.error(`No hay datos disponibles para la masa d’aigua seleccionada: ${masaAguaSeleccionada}`);
                return;
            }

            const años = Object.keys(transparenciaPorAño);
            const valores = Object.values(transparenciaPorAño);

            const canvasContainer = document.getElementById("canvas-container-transparencia");
            canvasContainer.innerHTML = '<canvas id="grafico-transparencia" width="400" height="300"></canvas>';
            const canvas = document.getElementById("grafico-transparencia");
            const ctx = canvas.getContext("2d");

            if (graficoTransparencia) {
                graficoTransparencia.destroy();
            }

            graficoTransparencia = new Chart(ctx, {
                type: "line",
                data: {
                    labels: años,
                    datasets: [{
                        label: `Transparència en ${masaAguaSeleccionada}`,
                        data: valores,
                        borderColor: "rgba(0, 123, 255, 1)",
                        backgroundColor: "rgba(0, 123, 255, 0.2)",
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: "Año" } },
                        y: { title: { display: true, text: "Transparencia Media (m)" } }
                    }
                }
            });

        })
        .catch(error => console.error("Error al cargar los datos:", error));
}


