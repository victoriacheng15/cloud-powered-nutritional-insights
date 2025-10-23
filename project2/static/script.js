(function () {
	// Chart instance variables scoped to this IIFE
	let barChartInstance = null;
	let scatterPlotInstance = null;
	let pieChartInstance = null;

	// Helper function to destroy chart instance if it exists
	function destroyChart(chartInstance) {
		if (chartInstance) chartInstance.destroy();
	}

	// Helper function to display error message
	function displayError(container, errorMessage) {
		const errorDiv = document.createElement("div");
		errorDiv.className =
			"bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded";
		errorDiv.textContent = `Error: ${errorMessage}`;
		container.appendChild(errorDiv);
	}

	// Helper function to display metadata
	function displayMetadata(container, metadataHTML) {
		const metadata = document.createElement("div");
		metadata.className = "mb-4 text-sm text-gray-600";
		metadata.innerHTML = metadataHTML;
		container.appendChild(metadata);
	}

	// Helper function to get base chart options with common properties
	function getBaseChartOptions(
		title,
		legendPosition = "top",
		additionalOptions = {},
	) {
		return {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				title: {
					display: true,
					text: title,
				},
				legend: {
					display: true,
					position: legendPosition,
				},
				...additionalOptions.plugins,
			},
			...additionalOptions,
		};
	}

	// Helper function to setup button event listener
	function setupButtonListener(buttonText, fetchFunction, ...args) {
		const buttons = document.querySelectorAll("button");
		const button = Array.from(buttons).find((btn) =>
			btn.textContent.includes(buttonText),
		);

		if (button) {
			button.addEventListener("click", async function () {
				const dietType = getDietType();
				await fetchFunction(dietType, ...args);
			});
		} else {
			console.warn(`${buttonText} button not found`);
		}
	}

	// Helper function to get diet type from select dropdown
	function getDietType() {
		const dietTypeSelect = document.querySelector("select");
		return dietTypeSelect ? dietTypeSelect.value : "all";
	}

	// Helper function to create pagination buttons
	function createPaginationButton(
		text,
		pageNumber,
		isActive = false,
		isDisabled = false,
		customClass = "",
	) {
		const btn = document.createElement("button");
		btn.textContent = text;
		btn.disabled = isDisabled;

		if (isActive) {
			btn.className = customClass || "px-3 py-1 bg-blue-600 text-white rounded";
		} else if (isDisabled) {
			btn.className =
				customClass ||
				"px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed";
		} else {
			btn.className =
				customClass || "px-3 py-1 bg-gray-300 rounded hover:bg-gray-400";
		}

		return btn;
	}

	// Helper function to create a table with headers and rows
	function createTable(headerHTML, headerClassName, dataItems, rowGenerator) {
		const table = document.createElement("table");
		table.className = "w-full border-collapse border border-gray-300 text-sm";
		table.style.marginBottom = "20px";
		table.style.tableLayout = "fixed";
		table.style.width = "100%";

		// Create header
		const thead = document.createElement("thead");
		thead.className = headerClassName;
		thead.innerHTML = headerHTML;
		table.appendChild(thead);

		// Create body
		const tbody = document.createElement("tbody");
		dataItems.forEach((item, index) => {
			const row = document.createElement("tr");
			row.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";
			row.innerHTML = rowGenerator(item);
			tbody.appendChild(row);
		});
		table.appendChild(tbody);

		return table;
	}

	// Helper function to display "no data found" message
	function displayNoData(container, message) {
		const noData = document.createElement("p");
		noData.className = "text-gray-500";
		noData.textContent = message;
		container.appendChild(noData);
	}

	// Helper function to setup display container and clear previous content
	function setupDisplayContainer(headingId, stopAtId = null, stopAtTag = null) {
		// Get the heading
		const heading = document.getElementById(headingId);

		// Show the heading
		heading.classList.remove("hidden");

		// Clear any previous content after the heading
		let currentElement = heading.nextElementSibling;
		while (currentElement) {
			// Stop if we reach the specified element ID or tag
			if (
				(stopAtId && currentElement.id === stopAtId) ||
				(stopAtTag && currentElement.tagName === stopAtTag)
			) {
				break;
			}
			const temp = currentElement;
			currentElement = currentElement.nextElementSibling;
			temp.remove();
		}

		// Create a new container for this batch of data
		const container = document.createElement("div");
		container.className = "mb-8";

		// Insert after heading
		heading.parentNode.insertBefore(container, heading.nextSibling);

		return container;
	}

	// Helper function for generic fetch and display
	async function fetchAndDisplay(url, displayFunction, errorData) {
		try {
			const response = await fetch(url);
			const data = await response.json();

			// Display the data
			displayFunction(data);

			return data;
		} catch (error) {
			console.error(`Error fetching from ${url}:`, error);
			displayFunction({ ...errorData, error: error.message });
		}
	}

	// Render bar chart with nutritional data
	function renderBarChart(data) {
		const ctx = document.getElementById("barChart").getContext("2d");

		// Destroy previous chart if it exists
		destroyChart(barChartInstance);

		barChartInstance = new Chart(ctx, {
			type: "bar",
			data: {
				labels: ["Protein (g)", "Carbs (g)", "Fat (g)"],
				datasets: [
					{
						label: "Average",
						data: [data.protein.average, data.carbs.average, data.fat.average],
						backgroundColor: "rgba(54, 162, 235, 0.8)",
						borderColor: "rgba(54, 162, 235, 1)",
						borderWidth: 1,
					},
					{
						label: "Min",
						data: [data.protein.min, data.carbs.min, data.fat.min],
						backgroundColor: "rgba(75, 192, 75, 0.8)",
						borderColor: "rgba(75, 192, 75, 1)",
						borderWidth: 1,
					},
					{
						label: "Max",
						data: [data.protein.max, data.carbs.max, data.fat.max],
						backgroundColor: "rgba(255, 99, 99, 0.8)",
						borderColor: "rgba(255, 99, 99, 1)",
						borderWidth: 1,
					},
				],
			},
			options: getBaseChartOptions(
				`Nutritional Insights - ${data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1)}`,
				"top",
				{
					scales: {
						y: {
							beginAtZero: true,
							title: {
								display: true,
								text: "Grams (g)",
							},
						},
					},
				},
			),
		});
	}

	// Render scatter plot - showing relationship between protein and carbs
	function renderScatterPlot(data) {
		const ctx = document.getElementById("scatterPlot").getContext("2d");

		// Destroy previous chart if it exists
		destroyChart(scatterPlotInstance);

		// Create scatter data points showing the average values
		const scatterData = [
			{
				x: data.protein.average,
				y: data.carbs.average,
				label: "Avg Protein vs Carbs",
			},
			{
				x: data.protein.min,
				y: data.carbs.min,
				label: "Min Protein vs Carbs",
			},
			{
				x: data.protein.max,
				y: data.carbs.max,
				label: "Max Protein vs Carbs",
			},
		];

		scatterPlotInstance = new Chart(ctx, {
			type: "scatter",
			data: {
				datasets: [
					{
						label: "Protein vs Carbs (Average)",
						data: [{ x: data.protein.average, y: data.carbs.average }],
						backgroundColor: "rgba(54, 162, 235, 0.8)",
						borderColor: "rgba(54, 162, 235, 1)",
						borderWidth: 2,
						pointRadius: 8,
					},
					{
						label: "Protein vs Carbs (Min)",
						data: [{ x: data.protein.min, y: data.carbs.min }],
						backgroundColor: "rgba(75, 192, 75, 0.8)",
						borderColor: "rgba(75, 192, 75, 1)",
						borderWidth: 2,
						pointRadius: 8,
					},
					{
						label: "Protein vs Carbs (Max)",
						data: [{ x: data.protein.max, y: data.carbs.max }],
						backgroundColor: "rgba(255, 99, 99, 0.8)",
						borderColor: "rgba(255, 99, 99, 1)",
						borderWidth: 2,
						pointRadius: 8,
					},
				],
			},
			options: getBaseChartOptions(
				`Nutrient Relationships - ${data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1)}`,
				"top",
				{
					scales: {
						x: {
							title: {
								display: true,
								text: "Protein (g)",
							},
							min: 0,
						},
						y: {
							title: {
								display: true,
								text: "Carbs (g)",
							},
							min: 0,
						},
					},
				},
			),
		});
	}

	// Render heatmap showing nutrient correlations
	function renderHeatmap(data) {
		const heatmapDiv = document.getElementById("heatmap");

		// Clear previous heatmap
		heatmapDiv.innerHTML = "";

		// Create correlation matrix based on nutritional data
		// We'll calculate simple correlation ratios between nutrients
		const nutrients = ["Protein", "Carbs", "Fat"];

		// Create correlation values (simplified for demo)
		const correlationMatrix = [
			[1.0, 0.3, 0.5], // Protein correlations
			[0.3, 1.0, 0.7], // Carbs correlations
			[0.5, 0.7, 1.0], // Fat correlations
		];

		// Create heatmap table
		const table = document.createElement("table");
		table.style.width = "100%";
		table.style.borderCollapse = "collapse";
		table.style.fontSize = "12px";

		// Create header row
		const headerRow = document.createElement("tr");
		const emptyCell = document.createElement("th");
		emptyCell.textContent = "";
		emptyCell.style.padding = "8px";
		emptyCell.style.border = "1px solid #ddd";
		headerRow.appendChild(emptyCell);

		nutrients.forEach((nutrient) => {
			const cell = document.createElement("th");
			cell.textContent = nutrient;
			cell.style.padding = "8px";
			cell.style.border = "1px solid #ddd";
			cell.style.textAlign = "center";
			cell.style.fontWeight = "bold";
			headerRow.appendChild(cell);
		});
		table.appendChild(headerRow);

		// Create data rows
		correlationMatrix.forEach((row, rowIndex) => {
			const tr = document.createElement("tr");

			// Row label
			const labelCell = document.createElement("th");
			labelCell.textContent = nutrients[rowIndex];
			labelCell.style.padding = "8px";
			labelCell.style.border = "1px solid #ddd";
			labelCell.style.fontWeight = "bold";
			labelCell.style.textAlign = "left";
			tr.appendChild(labelCell);

			// Data cells with color gradient
			row.forEach((value) => {
				const cell = document.createElement("td");
				cell.textContent = value.toFixed(2);
				cell.style.padding = "8px";
				cell.style.border = "1px solid #ddd";
				cell.style.textAlign = "center";

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
		const title = document.createElement("h4");
		title.textContent = `Nutrient Correlations - ${data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1)}`;
		title.style.marginBottom = "10px";
		title.style.fontSize = "14px";

		heatmapDiv.appendChild(title);
		heatmapDiv.appendChild(table);
	}

	// Render pie chart showing macronutrient distribution
	function renderPieChart(data) {
		const ctx = document.getElementById("pieChart").getContext("2d");

		// Destroy previous chart if it exists
		destroyChart(pieChartInstance);

		// Calculate total macronutrients (average values)
		const totalMacros =
			data.protein.average + data.carbs.average + data.fat.average;

		// Calculate percentages
		const proteinPercent = ((data.protein.average / totalMacros) * 100).toFixed(
			1,
		);
		const carbsPercent = ((data.carbs.average / totalMacros) * 100).toFixed(1);
		const fatPercent = ((data.fat.average / totalMacros) * 100).toFixed(1);

		pieChartInstance = new Chart(ctx, {
			type: "pie",
			data: {
				labels: [
					`Protein (${proteinPercent}%)`,
					`Carbs (${carbsPercent}%)`,
					`Fat (${fatPercent}%)`,
				],
				datasets: [
					{
						data: [data.protein.average, data.carbs.average, data.fat.average],
						backgroundColor: [
							"rgba(54, 162, 235, 0.8)", // Blue for Protein
							"rgba(255, 206, 86, 0.8)", // Yellow for Carbs
							"rgba(255, 99, 132, 0.8)", // Red for Fat
						],
						borderColor: [
							"rgba(54, 162, 235, 1)",
							"rgba(255, 206, 86, 1)",
							"rgba(255, 99, 132, 1)",
						],
						borderWidth: 2,
					},
				],
			},
			options: getBaseChartOptions(
				`Macronutrient Distribution - ${data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1)}`,
				"bottom",
				{
					plugins: {
						tooltip: {
							callbacks: {
								label: function (context) {
									const label = context.label || "";
									const value = context.parsed || 0;
									return `${label}: ${value.toFixed(1)}g`;
								},
							},
						},
					},
				},
			),
		});
	}

	async function getNutritionalInsights(dietType = "all") {
		try {
			const response = await fetch(
				`/api/nutritional-insights?diet_type=${dietType}`,
			);
			const data = await response.json();

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
			console.error("Error fetching nutritional insights:", error);
		}
	}

	// Fetch greeting from Flask backend (which will proxy to Function App)
	async function getGreeting() {
		try {
			const response = await fetch("/api/greeting?name=User");
			const data = await response.json();
			console.log("Greeting from Function App:", data);
			return data;
		} catch (error) {
			console.error("Error fetching greeting:", error);
		}
	}

	// Display recipes in a table format
	function displayRecipes(data) {
		const recipesContainer = setupDisplayContainer(
			"recipes-heading",
			"clusters-heading",
		);

		// Check for errors
		if (data.error) {
			displayError(recipesContainer, data.error);
			return;
		}

		// Display metadata
		const metadataHTML = `
            <p><strong>Diet Type:</strong> ${data.diet_type || "All"}</p>
            <p><strong>Total Recipes:</strong> ${data.total_count}</p>
            <p><strong>Page:</strong> ${data.page} of ${data.total_pages}</p>
        `;
		displayMetadata(recipesContainer, metadataHTML);

		// Create table for recipes
		if (data.recipes.length > 0) {
			const headerHTML = `
                <tr>
                    <th class="border border-gray-300 px-4 py-2 text-left" style="width: 50%;">Recipe Name</th>
                    <th class="border border-gray-300 px-4 py-2 text-left" style="width: 20%;">Cuisine</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Protein (g)</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Carbs (g)</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Fat (g)</th>
                </tr>
            `;
			const rowGenerator = (recipe) => `
                    <td class="border border-gray-300 px-4 py-2 overflow-hidden" style="width: 50%; word-wrap: break-word;">${recipe.recipe_name}</td>
                    <td class="border border-gray-300 px-4 py-2" style="width: 20%;">${recipe.cuisine_type}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${recipe.protein_g}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${recipe.carbs_g}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${recipe.fat_g}</td>
                `;
			const table = createTable(
				headerHTML,
				"bg-blue-100",
				data.recipes,
				rowGenerator,
			);
			recipesContainer.appendChild(table);
		} else {
			displayNoData(recipesContainer, "No recipes found for this diet type.");
		}

		// Create pagination controls
		const paginationDiv = document.createElement("div");
		paginationDiv.className = "flex justify-center gap-2 mt-4";

		// Previous button
		const prevBtn = createPaginationButton(
			"Previous",
			data.page - 1,
			false,
			!data.has_previous,
		);
		prevBtn.onclick = async () => {
			await getRecipes(getDietType(), data.page - 1);
		};
		paginationDiv.appendChild(prevBtn);

		// Calculate page range (show 5 pages at a time)
		const maxPagesToShow = 5;
		let startPage = Math.max(1, data.page - Math.floor(maxPagesToShow / 2));
		let endPage = Math.min(data.total_pages, startPage + maxPagesToShow - 1);

		// Adjust startPage if we're near the end
		if (endPage - startPage + 1 < maxPagesToShow) {
			startPage = Math.max(1, endPage - maxPagesToShow + 1);
		}

		// Show ellipsis and first page if needed
		if (startPage > 1) {
			const firstBtn = createPaginationButton("1", 1);
			firstBtn.onclick = async () => {
				await getRecipes(getDietType(), 1);
			};
			paginationDiv.appendChild(firstBtn);

			if (startPage > 2) {
				const ellipsis = document.createElement("span");
				ellipsis.textContent = "...";
				ellipsis.className = "px-2 py-1";
				paginationDiv.appendChild(ellipsis);
			}
		}

		// Page numbers (limited to 5)
		for (let i = startPage; i <= endPage; i++) {
			const pageBtn = createPaginationButton(i, i, i === data.page);
			pageBtn.onclick = async () => {
				await getRecipes(getDietType(), i);
			};
			paginationDiv.appendChild(pageBtn);
		}

		// Show ellipsis and last page if needed
		if (endPage < data.total_pages) {
			if (endPage < data.total_pages - 1) {
				const ellipsis = document.createElement("span");
				ellipsis.textContent = "...";
				ellipsis.className = "px-2 py-1";
				paginationDiv.appendChild(ellipsis);
			}

			const lastBtn = createPaginationButton(
				data.total_pages,
				data.total_pages,
			);
			lastBtn.onclick = async () => {
				await getRecipes(getDietType(), data.total_pages);
			};
			paginationDiv.appendChild(lastBtn);
		}

		// Next button
		const nextBtn = createPaginationButton(
			"Next",
			data.page + 1,
			false,
			!data.has_next,
		);
		nextBtn.onclick = async () => {
			await getRecipes(getDietType(), data.page + 1);
		};
		paginationDiv.appendChild(nextBtn);

		recipesContainer.appendChild(paginationDiv);
	}

	// Display clusters in a summary format
	function displayClusters(data) {
		const clustersContainer = setupDisplayContainer(
			"clusters-heading",
			null,
			"FOOTER",
		);

		// Check for errors
		if (data.error) {
			displayError(clustersContainer, data.error);
			return;
		}

		// Display metadata
		const metadataHTML = `
            <p><strong>Diet Type:</strong> ${data.diet_type || "All"}</p>
            <p><strong>Total Recipes:</strong> ${data.total_recipes}</p>
            <p><strong>Number of Clusters:</strong> ${data.num_clusters}</p>
        `;
		displayMetadata(clustersContainer, metadataHTML);

		// Create table for clusters
		if (data.clusters && data.clusters.length > 0) {
			const headerHTML = `
                <tr>
                    <th class="border border-gray-300 px-4 py-2 text-left" style="width: 25%;">Cluster Label</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Recipes</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Protein (g)</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Carbs (g)</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Fat (g)</th>
                    <th class="border border-gray-300 px-4 py-2 text-left" style="width: 35%;">Sample Recipes</th>
                </tr>
            `;
			const rowGenerator = (cluster) => {
				const sampleRecipes = cluster.sample_recipes
					? cluster.sample_recipes.slice(0, 2).join(", ")
					: "N/A";
				return `
                    <td class="border border-gray-300 px-4 py-2" style="width: 25%; word-wrap: break-word;"><strong>${cluster.label}</strong></td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${cluster.recipe_count}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${cluster.avg_protein}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${cluster.avg_carbs}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${cluster.avg_fat}</td>
                    <td class="border border-gray-300 px-4 py-2 text-xs" style="width: 35%; word-wrap: break-word;">${sampleRecipes}</td>
                `;
			};
			const table = createTable(
				headerHTML,
				"bg-purple-100",
				data.clusters,
				rowGenerator,
			);
			clustersContainer.appendChild(table);
		} else {
			displayNoData(clustersContainer, "No clusters found for this diet type.");
		}
	}

	// Fetch clusters from Flask backend
	// Fetch clusters from Flask backend
	async function getClusters(dietType = "all", numClusters = 3) {
		const url = `/api/clusters?diet_type=${dietType}&num_clusters=${numClusters}`;
		return fetchAndDisplay(url, displayClusters, {
			clusters: [],
			total_recipes: 0,
		});
	}

	// Fetch recipes from Flask backend
	// Fetch recipes from Flask backend
	async function getRecipes(dietType = "all", page = 1, pageSize = 20) {
		const url = `/api/recipes?diet_type=${dietType}&page=${page}&page_size=${pageSize}`;
		return fetchAndDisplay(url, displayRecipes, {
			recipes: [],
			total_count: 0,
		});
	}

	// Set up event listeners for buttons
	document.addEventListener("DOMContentLoaded", async function () {
		// Test greeting endpoint
		await getGreeting();

		// Load default nutritional insights on page load
		await getNutritionalInsights("all");

		// Setup button event listeners
		setupButtonListener("Get Nutritional Insights", getNutritionalInsights);
		setupButtonListener("Get Recipes", getRecipes, 1, 20);
		setupButtonListener("Get Clusters", getClusters, 3);
	});
})();
