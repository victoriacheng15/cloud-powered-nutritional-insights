(function () {
    // Chart instance variables scoped to this IIFE
    let barChartInstance = null;
    let scatterPlotInstance = null;
    let pieChartInstance = null;

    // Render bar chart with nutritional data
    function renderBarChart(data) {
        const ctx = document.getElementById('barChart').getContext('2d');

        // Destroy previous chart if it exists
        if (barChartInstance) {
            barChartInstance.destroy();
        }

        barChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Protein (g)', 'Carbs (g)', 'Fat (g)'],
                datasets: [
                    {
                        label: 'Average',
                        data: [data.protein.average, data.carbs.average, data.fat.average],
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Min',
                        data: [data.protein.min, data.carbs.min, data.fat.min],
                        backgroundColor: 'rgba(75, 192, 75, 0.8)',
                        borderColor: 'rgba(75, 192, 75, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Max',
                        data: [data.protein.max, data.carbs.max, data.fat.max],
                        backgroundColor: 'rgba(255, 99, 99, 0.8)',
                        borderColor: 'rgba(255, 99, 99, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Nutritional Insights - ${data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1)}`
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Grams (g)'
                        }
                    }
                }
            }
        });
    }

    // Render scatter plot - showing relationship between protein and carbs
    function renderScatterPlot(data) {
        const ctx = document.getElementById('scatterPlot').getContext('2d');

        // Destroy previous chart if it exists
        if (scatterPlotInstance) {
            scatterPlotInstance.destroy();
        }

        // Create scatter data points showing the average values
        const scatterData = [
            {
                x: data.protein.average,
                y: data.carbs.average,
                label: 'Avg Protein vs Carbs'
            },
            {
                x: data.protein.min,
                y: data.carbs.min,
                label: 'Min Protein vs Carbs'
            },
            {
                x: data.protein.max,
                y: data.carbs.max,
                label: 'Max Protein vs Carbs'
            }
        ];

        scatterPlotInstance = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Protein vs Carbs (Average)',
                        data: [{ x: data.protein.average, y: data.carbs.average }],
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        pointRadius: 8
                    },
                    {
                        label: 'Protein vs Carbs (Min)',
                        data: [{ x: data.protein.min, y: data.carbs.min }],
                        backgroundColor: 'rgba(75, 192, 75, 0.8)',
                        borderColor: 'rgba(75, 192, 75, 1)',
                        borderWidth: 2,
                        pointRadius: 8
                    },
                    {
                        label: 'Protein vs Carbs (Max)',
                        data: [{ x: data.protein.max, y: data.carbs.max }],
                        backgroundColor: 'rgba(255, 99, 99, 0.8)',
                        borderColor: 'rgba(255, 99, 99, 1)',
                        borderWidth: 2,
                        pointRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Nutrient Relationships - ${data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1)}`
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Protein (g)'
                        },
                        min: 0
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Carbs (g)'
                        },
                        min: 0
                    }
                }
            }
        });
    }

    // Render heatmap showing nutrient correlations
    function renderHeatmap(data) {
        const heatmapDiv = document.getElementById('heatmap');

        // Clear previous heatmap
        heatmapDiv.innerHTML = '';

        // Create correlation matrix based on nutritional data
        // We'll calculate simple correlation ratios between nutrients
        const nutrients = ['Protein', 'Carbs', 'Fat'];

        // Create correlation values (simplified for demo)
        const correlationMatrix = [
            [1.0, 0.3, 0.5],      // Protein correlations
            [0.3, 1.0, 0.7],      // Carbs correlations
            [0.5, 0.7, 1.0]       // Fat correlations
        ];

        // Create heatmap table
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '12px';

        // Create header row
        const headerRow = document.createElement('tr');
        const emptyCell = document.createElement('th');
        emptyCell.textContent = '';
        emptyCell.style.padding = '8px';
        emptyCell.style.border = '1px solid #ddd';
        headerRow.appendChild(emptyCell);

        nutrients.forEach(nutrient => {
            const cell = document.createElement('th');
            cell.textContent = nutrient;
            cell.style.padding = '8px';
            cell.style.border = '1px solid #ddd';
            cell.style.textAlign = 'center';
            cell.style.fontWeight = 'bold';
            headerRow.appendChild(cell);
        });
        table.appendChild(headerRow);

        // Create data rows
        correlationMatrix.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');

            // Row label
            const labelCell = document.createElement('th');
            labelCell.textContent = nutrients[rowIndex];
            labelCell.style.padding = '8px';
            labelCell.style.border = '1px solid #ddd';
            labelCell.style.fontWeight = 'bold';
            labelCell.style.textAlign = 'left';
            tr.appendChild(labelCell);

            // Data cells with color gradient
            row.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value.toFixed(2);
                cell.style.padding = '8px';
                cell.style.border = '1px solid #ddd';
                cell.style.textAlign = 'center';

                // Apply color gradient based on correlation value
                // 0 = white, 0.5 = yellow, 1.0 = red
                let color;
                if (value < 0.33) {
                    color = `rgb(255, ${Math.round(255 * (1 - value * 3))}, 200)`;
                } else if (value < 0.67) {
                    color = `rgb(255, ${Math.round(255 * (1 - (value - 0.33) * 1.5))}, 100)`;
                } else {
                    color = `rgb(255, ${Math.round(255 * (1 - (value - 0.67) * 1.5))}, 50)`;
                }
                cell.style.backgroundColor = color;

                tr.appendChild(cell);
            });

            table.appendChild(tr);
        });

        // Add title
        const title = document.createElement('h4');
        title.textContent = `Nutrient Correlations - ${data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1)}`;
        title.style.marginBottom = '10px';
        title.style.fontSize = '14px';

        heatmapDiv.appendChild(title);
        heatmapDiv.appendChild(table);
    }

    // Render pie chart showing macronutrient distribution
    function renderPieChart(data) {
        const ctx = document.getElementById('pieChart').getContext('2d');

        // Destroy previous chart if it exists
        if (pieChartInstance) {
            pieChartInstance.destroy();
        }

        // Calculate total macronutrients (average values)
        const totalMacros = data.protein.average + data.carbs.average + data.fat.average;

        // Calculate percentages
        const proteinPercent = ((data.protein.average / totalMacros) * 100).toFixed(1);
        const carbsPercent = ((data.carbs.average / totalMacros) * 100).toFixed(1);
        const fatPercent = ((data.fat.average / totalMacros) * 100).toFixed(1);

        pieChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [
                    `Protein (${proteinPercent}%)`,
                    `Carbs (${carbsPercent}%)`,
                    `Fat (${fatPercent}%)`
                ],
                datasets: [
                    {
                        data: [data.protein.average, data.carbs.average, data.fat.average],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.8)',   // Blue for Protein
                            'rgba(255, 206, 86, 0.8)',   // Yellow for Carbs
                            'rgba(255, 99, 132, 0.8)'    // Red for Fat
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Macronutrient Distribution - ${data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1)}`
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${value.toFixed(1)}g`;
                            }
                        }
                    }
                }
            }
        });
    }

    async function getNutritionalInsights(dietType = 'all') {
        try {
            const response = await fetch(`/api/nutritional-insights?diet_type=${dietType}`);
            const data = await response.json();
            // console.log(`Nutritional Insights for ${dietType}:`, data);

            // Render the bar chart with the data
            renderBarChart(data);
            // Render the scatter plot with the data
            renderScatterPlot(data);
            // Render the heatmap with the data
            renderHeatmap(data);
            // Render the pie chart with the data
            renderPieChart(data);

            return data;
        } catch (error) {
            console.error('Error fetching nutritional insights:', error);
        }
    }

    // Fetch greeting from Flask backend (which will proxy to Function App)
    async function getGreeting() {
        try {
            const response = await fetch('/api/greeting?name=User');
            const data = await response.json();
            console.log('Greeting from Function App:', data);
            return data;
        } catch (error) {
            console.error('Error fetching greeting:', error);
        }
    }

    // Set up event listeners for buttons
    document.addEventListener('DOMContentLoaded', async function () {
        // Test greeting endpoint
        await getGreeting();

        // Get the "Get Nutritional Insights" button by finding button with matching text
        const buttons = document.querySelectorAll('button');
        const insightsButton = Array.from(buttons).find(btn => btn.textContent.includes('Get Nutritional Insights'));

        if (insightsButton) {
            insightsButton.addEventListener('click', async function () {
                // Get selected diet type from dropdown
                const dietTypeSelect = document.querySelector('select');
                const dietType = dietTypeSelect ? dietTypeSelect.value : 'all';
                // console.log(`Getting nutritional insights for: ${dietType}`);
                await getNutritionalInsights(dietType);
            });
        } else {
            console.warn('Get Nutritional Insights button not found');
        }
    });
})(); // Close IIFE