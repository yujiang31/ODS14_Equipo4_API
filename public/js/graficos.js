document.addEventListener("DOMContentLoaded", () => {
    fetch("/elementosFisicoquimicos/datos-json")
        .then(response => response.json())
        .then(data => {
            console.log("Datos recibidos:", data);

            function resetCanvas(canvasId) {
                const canvasElement = document.getElementById(canvasId);
                const parent = canvasElement.parentNode;

                // 🔹 Reemplazar el canvas por uno nuevo para evitar acumulaciones
                const newCanvas = document.createElement("canvas");
                newCanvas.id = canvasId;
                newCanvas.width = 400; // 🔹 Fijar ancho
                newCanvas.height = 300; // 🔹 Fijar alto
                parent.replaceChild(newCanvas, canvasElement);
            }

            // 🔹 Año más reciente
            resetCanvas("grafico-temperatura-reciente");
            const ctxReciente = document.getElementById("grafico-temperatura-reciente").getContext("2d");

            if (window.chartReciente) {
                window.chartReciente.destroy();
            }

            window.chartReciente = new Chart(ctxReciente, {
                type: "bar",
                data: {
                    labels: Object.keys(data.añoMasReciente.datos),
                    datasets: [{
                        label: `Temperatura media en ${data.añoMasReciente.año}`,
                        data: Object.values(data.añoMasReciente.datos),
                        backgroundColor: "blue"
                    }]
                },
                options: {
                    responsive: false, // 🔹 Desactiva cambios automáticos de tamaño
                    maintainAspectRatio: false,
                    scales: {
                        x: { title: { display: true, text: "Profundidad (m)" } },
                        y: { title: { display: true, text: "Temperatura (°C)" } }
                    }
                }
            });

            // 🔹 Año más antiguo
            resetCanvas("grafico-temperatura-antiguo");
            const ctxAntiguo = document.getElementById("grafico-temperatura-antiguo").getContext("2d");

            if (window.chartAntiguo) {
                window.chartAntiguo.destroy();
            }

            window.chartAntiguo = new Chart(ctxAntiguo, {
                type: "bar",
                data: {
                    labels: Object.keys(data.añoMasAntiguo.datos),
                    datasets: [{
                        label: `Temperatura media en ${data.añoMasAntiguo.año}`,
                        data: Object.values(data.añoMasAntiguo.datos),
                        backgroundColor: "red"
                    }]
                },
                options: {
                    responsive: false, // 🔹 Desactiva cambios automáticos de tamaño
                    maintainAspectRatio: false,
                    scales: {
                        x: { title: { display: true, text: "Profundidad (m)" } },
                        y: { title: { display: true, text: "Temperatura (°C)" } }
                    }
                }
            });

        })
        .catch(error => console.error("Error al cargar los datos:", error));
});
