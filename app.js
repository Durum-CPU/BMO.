
async function getData(filename) {
    const response = await fetch(`data/${filename}`);

    if (!response.ok) {
        throw new Error(`Kunne ikke hente ${filename}`);
    }

    return response.json();
}

// Formater tal efter dansk standard
function formatNumber(value, decimals = 1) {
    return Number(value).toLocaleString("da-DK", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// Vis de fire nøgletal
function renderSummary(data) {
    document.getElementById("totalPlaces").textContent =
        data.totalPlaces;

    document.getElementById("averageScore").textContent =
        `${formatNumber(data.averageScore)} / 7`;

    document.getElementById("averagePrice").textContent =
        `${formatNumber(data.averagePrice, 0)} kr.`;

    document.getElementById("medianPrice").textContent =
        `${formatNumber(data.medianPrice, 0)} kr.`;
}

// Vis BMO-score fordelt på område

function renderScoreChart(data) {
    const labels = data.map(item => item.area);
    const scores = data.map(item => Number(item.score));

    const highestScore = Math.max(...scores);

    new Chart(document.getElementById("scoreChart"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Gennemsnitlig BMO-score",
                data: scores,
                backgroundColor: scores.map(score =>
                    score === highestScore ? "#dce75d" : "#829477"
                ),
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: 7,
                    title: {
                        display: true,
                        text: "Score (1–7)"
                    }
                }
            }
        }
    });
}


// Vis pivot-tabellen med ostetyper
function renderPivotTable(data) {
    const table = document.getElementById("pivotTable");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    const areas = [...new Set(data.map(item => item.area))];
    const cheeseTypes = [...new Set(data.map(item => item.cheeseType))];

    thead.innerHTML = `
        <tr>
            <th>Område</th>
            ${cheeseTypes.map(type => `<th>${type}</th>`).join("")}
        </tr>
    `;

    tbody.innerHTML = areas.map(area => {
        const cells = cheeseTypes.map(type => {
            const match = data.find(item =>
                item.area === area && item.cheeseType === type
            );

            return `<td>${match ? match.places : 0}</td>`;
        });

        return `
            <tr>
                <th>${area}</th>
                ${cells.join("")}
            </tr>
        `;
    }).join("");
}

// Vis prisfordelingen
function renderPriceChart(data) {
    new Chart(document.getElementById("priceChart"), {
        type: "bar",
        data: {
            labels: data.map(item => item.priceRange),
            datasets: [{
                label: "Antal BMO-steder",
                data: data.map(item => item.total),
                backgroundColor: "#829477",
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Start hjemmesiden
async function init() {
    const status = document.getElementById("status");

    try {
        const [
            summary,
            scores,
            pivot,
            prices
        ] = await Promise.all([
            getData("summary.json"),
            getData("score-by-area.json"),
            getData("cheese-pivot.json"),
            getData("price-distribution.json")
        ]);

        renderSummary(summary);
        renderScoreChart(scores);
        renderPivotTable(pivot);
        renderPriceChart(prices);

        status.textContent = "Analysen er baseret på de registrerede data, fra sættet bolle-med-ost.xlsx (med opdateret data)";
    } catch (error) {
        console.error("Fejl ved indlæsning:", error);
        status.textContent = "Der opstod en fejl ved indlæsning af data.";
    }
}

init();
