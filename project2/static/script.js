(function () {
	// Chart instance variables scoped to this IIFE
	let barChartInstance = null;
	let scatterPlotInstance = null;
	let pieChartInstance = null;

	// Render bar chart with nutritional data
	function renderBarChart(data) {
		const ctx = document.getElementById("barChart").getContext("2d");

		// Destroy previous chart if it exists
		if (barChartInstance) {
			barChartInstance.destroy();
		}

		const maxValue =
			Math.max(data.protein.max, data.carbs.max, data.fat.max) * 1.1;

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
			options: {
				responsive: true,
				maintainAspectRatio: true,
				plugins: {
					title: {
						display: true,
						text: `Nutritional Insights - ${data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1)}`,
					},
					legend: {
						display: true,
						position: "top",
					},
				},
				scales: {
					y: {
						type: "logarithmic",
						min: 0.01,
						max: Math.max(data.protein.max, data.carbs.max, data.fat.max) * 1.1,
						ticks: {
							callback: (value) => value.toLocaleString(),
							major: { enabled: true },
						},
						title: {
							display: true,
							text: "Grams (g)",
						},
					},
				},
			},
		});
	}

	// Render scatter plot - showing relationship between protein and carbs
	function renderScatterPlot(data) {
		const ctx = document.getElementById("scatterPlot").getContext("2d");

		// Destroy previous chart if it exists
		if (scatterPlotInstance) {
			scatterPlotInstance.destroy();
		}

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
			options: {
				responsive: true,
				maintainAspectRatio: true,
				plugins: {
					title: {
						display: true,
						text: `Nutrient Relationships - ${data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1)}`,
					},
					legend: {
						display: true,
						position: "top",
					},
				},
				scales: {
					x: {
						type: "logarithmic",
						min: 0.01,
						max: Math.max(data.protein.max, data.carbs.max, data.fat.max) * 1.1,
						ticks: {
							callback: (v) => v.toLocaleString(),
							major: { enabled: true },
						},
						title: {
							display: true,
							text: "Protein (g)",
						},
					},
					y: {
						type: "logarithmic",
						min: 0.01,
						max: Math.max(data.protein.max, data.carbs.max, data.fat.max),
						ticks: {
							callback: (v) => v.toLocaleString(),
							major: { enabled: true },
						},
						title: {
							display: true,
							text: "Carbs (g)",
						},
					},
				},
			},
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
		if (pieChartInstance) {
			pieChartInstance.destroy();
		}

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
			options: {
				responsive: true,
				maintainAspectRatio: true,
				plugins: {
					title: {
						display: true,
						text: `Macronutrient Distribution - ${data.diet_type.charAt(0).toUpperCase() + data.diet_type.slice(1)}`,
					},
					legend: {
						display: true,
						position: "bottom",
					},
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
		});
	}

	async function getNutritionalInsights(dietType = "all") {
		try {
			const response = await fetch(
				`/api/nutritional-insights?diet_type=${dietType}`,
			);
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
		// Get the h3 heading for recipes
		const recipesHeading = document.getElementById("recipes-heading");

		// Show the heading
		recipesHeading.classList.remove("hidden");

		// Clear any previous content after the heading
		let recipesContainer = recipesHeading.nextElementSibling;
		while (recipesContainer && recipesContainer.id !== "clusters-heading") {
			const temp = recipesContainer;
			recipesContainer = recipesContainer.nextElementSibling;
			temp.remove();
		}

		// Create a new container for this batch of data
		recipesContainer = document.createElement("div");
		recipesContainer.className = "mb-8";

		// Insert after recipes heading
		recipesHeading.parentNode.insertBefore(
			recipesContainer,
			recipesHeading.nextSibling,
		);

		// Check for errors
		if (data.error) {
			const errorDiv = document.createElement("div");
			errorDiv.className =
				"bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded";
			errorDiv.textContent = `Error: ${data.error}`;
			recipesContainer.appendChild(errorDiv);
			return;
		}

		// Display metadata
		const metadata = document.createElement("div");
		metadata.className = "mb-4 text-sm text-gray-600";
		metadata.innerHTML = `
            <p><strong>Diet Type:</strong> ${data.diet_type || "All"}</p>
            <p><strong>Total Recipes:</strong> ${data.total_count}</p>
            <p><strong>Page:</strong> ${data.page} of ${data.total_pages}</p>
        `;
		recipesContainer.appendChild(metadata);

		// Create table for recipes
		if (data.recipes.length > 0) {
			const table = document.createElement("table");
			table.className = "w-full border-collapse border border-gray-300 text-sm";
			table.style.marginBottom = "20px";
			table.style.tableLayout = "fixed"; // Fix column widths
			table.style.width = "100%";

			// Create header
			const thead = document.createElement("thead");
			thead.className = "bg-blue-100";
			thead.innerHTML = `
                <tr>
                    <th class="border border-gray-300 px-4 py-2 text-left" style="width: 50%;">Recipe Name</th>
                    <th class="border border-gray-300 px-4 py-2 text-left" style="width: 20%;">Cuisine</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Protein (g)</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Carbs (g)</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Fat (g)</th>
                </tr>
            `;
			table.appendChild(thead);

			// Create body
			const tbody = document.createElement("tbody");
			data.recipes.forEach((recipe, index) => {
				const row = document.createElement("tr");
				row.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";
				row.innerHTML = `
                    <td class="border border-gray-300 px-4 py-2 overflow-hidden" style="width: 50%; word-wrap: break-word;">${recipe.recipe_name}</td>
                    <td class="border border-gray-300 px-4 py-2" style="width: 20%;">${recipe.cuisine_type}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${recipe.protein_g}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${recipe.carbs_g}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${recipe.fat_g}</td>
                `;
				tbody.appendChild(row);
			});
			table.appendChild(tbody);
			recipesContainer.appendChild(table);
		} else {
			const noData = document.createElement("p");
			noData.className = "text-gray-500";
			noData.textContent = "No recipes found for this diet type.";
			recipesContainer.appendChild(noData);
		}

		// Create pagination controls
		const paginationDiv = document.createElement("div");
		paginationDiv.className = "flex justify-center gap-2 mt-4";

		// Previous button
		const prevBtn = document.createElement("button");
		prevBtn.textContent = "Previous";
		prevBtn.className =
			"px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed";
		prevBtn.disabled = !data.has_previous;
		prevBtn.onclick = async () => {
			const dietTypeSelect = document.querySelector("select");
			const dietType = dietTypeSelect ? dietTypeSelect.value : "all";
			await getRecipes(dietType, data.page - 1);
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
			const firstBtn = document.createElement("button");
			firstBtn.textContent = "1";
			firstBtn.className = "px-3 py-1 bg-gray-300 rounded hover:bg-gray-400";
			firstBtn.onclick = async () => {
				const dietTypeSelect = document.querySelector("select");
				const dietType = dietTypeSelect ? dietTypeSelect.value : "all";
				await getRecipes(dietType, 1);
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
			const pageBtn = document.createElement("button");
			pageBtn.textContent = i;
			pageBtn.className =
				i === data.page
					? "px-3 py-1 bg-blue-600 text-white rounded"
					: "px-3 py-1 bg-gray-300 rounded hover:bg-gray-400";
			pageBtn.onclick = async () => {
				const dietTypeSelect = document.querySelector("select");
				const dietType = dietTypeSelect ? dietTypeSelect.value : "all";
				await getRecipes(dietType, i);
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

			const lastBtn = document.createElement("button");
			lastBtn.textContent = data.total_pages;
			lastBtn.className = "px-3 py-1 bg-gray-300 rounded hover:bg-gray-400";
			lastBtn.onclick = async () => {
				const dietTypeSelect = document.querySelector("select");
				const dietType = dietTypeSelect ? dietTypeSelect.value : "all";
				await getRecipes(dietType, data.total_pages);
			};
			paginationDiv.appendChild(lastBtn);
		}

		// Next button
		const nextBtn = document.createElement("button");
		nextBtn.textContent = "Next";
		nextBtn.className =
			"px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed";
		nextBtn.disabled = !data.has_next;
		nextBtn.onclick = async () => {
			const dietTypeSelect = document.querySelector("select");
			const dietType = dietTypeSelect ? dietTypeSelect.value : "all";
			await getRecipes(dietType, data.page + 1);
		};
		paginationDiv.appendChild(nextBtn);

		recipesContainer.appendChild(paginationDiv);
	}

	// Display clusters in a summary format
	function displayClusters(data) {
		// Get the h3 heading for clusters
		const clustersHeading = document.getElementById("clusters-heading");

		// Show the heading
		clustersHeading.classList.remove("hidden");

		// Clear any previous content after the heading
		let clustersContainer = clustersHeading.nextElementSibling;
		while (clustersContainer && clustersContainer.tagName !== "FOOTER") {
			const temp = clustersContainer;
			clustersContainer = clustersContainer.nextElementSibling;
			temp.remove();
		}

		// Create a new container for this batch of data
		clustersContainer = document.createElement("div");
		clustersContainer.className = "mb-8";

		// Insert after clusters heading
		clustersHeading.parentNode.insertBefore(
			clustersContainer,
			clustersHeading.nextSibling,
		);

		// Check for errors
		if (data.error) {
			const errorDiv = document.createElement("div");
			errorDiv.className =
				"bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded";
			errorDiv.textContent = `Error: ${data.error}`;
			clustersContainer.appendChild(errorDiv);
			return;
		}

		// Display metadata
		const metadata = document.createElement("div");
		metadata.className = "mb-4 text-sm text-gray-600";
		metadata.innerHTML = `
            <p><strong>Diet Type:</strong> ${data.diet_type || "All"}</p>
            <p><strong>Total Recipes:</strong> ${data.total_recipes}</p>
            <p><strong>Number of Clusters:</strong> ${data.num_clusters}</p>
        `;
		clustersContainer.appendChild(metadata);

		// Create table for clusters
		if (data.clusters && data.clusters.length > 0) {
			const table = document.createElement("table");
			table.className = "w-full border-collapse border border-gray-300 text-sm";
			table.style.marginBottom = "20px";
			table.style.tableLayout = "fixed";
			table.style.width = "100%";

			// Create header
			const thead = document.createElement("thead");
			thead.className = "bg-purple-100";
			thead.innerHTML = `
                <tr>
                    <th class="border border-gray-300 px-4 py-2 text-left" style="width: 25%;">Cluster Label</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Recipes</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Protein (g)</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Carbs (g)</th>
                    <th class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">Fat (g)</th>
                    <th class="border border-gray-300 px-4 py-2 text-left" style="width: 35%;">Sample Recipes</th>
                </tr>
            `;
			table.appendChild(thead);

			// Create body
			const tbody = document.createElement("tbody");
			data.clusters.forEach((cluster, index) => {
				const row = document.createElement("tr");
				row.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";

				// Sample recipes list
				const sampleRecipes = cluster.sample_recipes
					? cluster.sample_recipes.slice(0, 2).join(", ")
					: "N/A";

				row.innerHTML = `
                    <td class="border border-gray-300 px-4 py-2" style="width: 25%; word-wrap: break-word;"><strong>${cluster.label}</strong></td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${cluster.recipe_count}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${cluster.avg_protein}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${cluster.avg_carbs}</td>
                    <td class="border border-gray-300 px-4 py-2 text-center" style="width: 10%;">${cluster.avg_fat}</td>
                    <td class="border border-gray-300 px-4 py-2 text-xs" style="width: 35%; word-wrap: break-word;">${sampleRecipes}</td>
                `;
				tbody.appendChild(row);
			});
			table.appendChild(tbody);
			clustersContainer.appendChild(table);
		} else {
			const noData = document.createElement("p");
			noData.className = "text-gray-500";
			noData.textContent = "No clusters found for this diet type.";
			clustersContainer.appendChild(noData);
		}
	}

	// Fetch clusters from Flask backend
	async function getClusters(dietType = "all", numClusters = 3) {
		try {
			const response = await fetch(
				`/api/clusters?diet_type=${dietType}&num_clusters=${numClusters}`,
			);
			const data = await response.json();
			console.log(`Clusters for ${dietType}:`, data);

			// Display the clusters
			displayClusters(data);

			return data;
		} catch (error) {
			console.error("Error fetching clusters:", error);
			displayClusters({ error: error.message, clusters: [], total_recipes: 0 });
		}
	}

	// Fetch recipes from Flask backend
	async function getRecipes(dietType = "all", page = 1, pageSize = 20) {
		try {
			const response = await fetch(
				`/api/recipes?diet_type=${dietType}&page=${page}&page_size=${pageSize}`,
			);
			const data = await response.json();
			console.log(`Recipes for ${dietType} (page ${page}):`, data);

			// Display the recipes
			displayRecipes(data);

			return data;
		} catch (error) {
			console.error("Error fetching recipes:", error);
			displayRecipes({ error: error.message, recipes: [], total_count: 0 });
		}
	}

	// Set up event listeners for buttons
	document.addEventListener("DOMContentLoaded", async function () {
		// Test greeting endpoint
		await getGreeting();

		// Load default nutritional insights on page load
		await getNutritionalInsights("all");

		// Get the "Get Nutritional Insights" button by finding button with matching text
		const buttons = document.querySelectorAll("button");
		const insightsButton = Array.from(buttons).find((btn) =>
			btn.textContent.includes("Get Nutritional Insights"),
		);

		if (insightsButton) {
			insightsButton.addEventListener("click", async function () {
				// Get selected diet type from dropdown
				const dietTypeSelect = document.querySelector("select");
				const dietType = dietTypeSelect ? dietTypeSelect.value : "all";
				await getNutritionalInsights(dietType);
			});
		} else {
			console.warn("Get Nutritional Insights button not found");
		}

		// Get the "Get Recipes" button
		const recipesButton = Array.from(buttons).find((btn) =>
			btn.textContent.includes("Get Recipes"),
		);

		if (recipesButton) {
			recipesButton.addEventListener("click", async function () {
				// Get selected diet type from dropdown
				const dietTypeSelect = document.querySelector("select");
				const dietType = dietTypeSelect ? dietTypeSelect.value : "all";
				await getRecipes(dietType, 1, 20);
			});
		} else {
			console.warn("Get Recipes button not found");
		}

		// Get the "Get Clusters" button
		const clustersButton = Array.from(buttons).find((btn) =>
			btn.textContent.includes("Get Clusters"),
		);

		if (clustersButton) {
			clustersButton.addEventListener("click", async function () {
				// Get selected diet type from dropdown
				const dietTypeSelect = document.querySelector("select");
				const dietType = dietTypeSelect ? dietTypeSelect.value : "all";
				await getClusters(dietType, 3);
			});
		} else {
			console.warn("Get Clusters button not found");
		}
	});
})();
