(function () {
	// Security Status Color Mapping
	const statusColorMap = {
		"Enabled": "text-green-600",
		"Disabled": "text-red-600",
		"Secure": "text-green-600",
		"Compromised": "text-red-600",
		"Compliant": "text-green-600",
		"Non-Compliant": "text-red-600"
	};

	// Fetch and display security status on page load
	async function loadSecurityStatus() {
		try {
			const response = await fetch("/api/security-status");
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();

			// Update encryption status
			const encryptionEl = document.getElementById("encryption-status");
			if (encryptionEl) {
				encryptionEl.textContent = data.encryption;
				encryptionEl.className = `font-semibold ${statusColorMap[data.encryption] || "text-yellow-600"}`;
			}
			
			// Update access control status
			const accessControlEl = document.getElementById("access-control-status");
			if (accessControlEl) {
				accessControlEl.textContent = data.access_control;
				accessControlEl.className = `font-semibold ${statusColorMap[data.access_control] || "text-yellow-600"}`;
			}
			
			// Update compliance status
			const complianceEl = document.getElementById("compliance-status");
			if (complianceEl) {
				complianceEl.textContent = data.compliance;
				complianceEl.className = `font-semibold ${statusColorMap[data.compliance] || "text-yellow-600"}`;
			}
			
			// Update timestamp
			const timestampEl = document.getElementById("security-timestamp");
			if (timestampEl && data.timestamp) {
				const date = String(data.timestamp).replace("T", " ").replace(/\.\d+/, "")
				timestampEl.textContent = date + " UTC";
			}
		} catch (error) {
			console.error("Error loading security status:", error);
			// Set error state
			document.getElementById("encryption-status").textContent = "Error";
			document.getElementById("access-control-status").textContent = "Error";
			document.getElementById("compliance-status").textContent = "Error";
		}
	}

	// Load security status when DOM is ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", loadSecurityStatus);
	} else {
		loadSecurityStatus();
	}

	function setOAuthStatus(text, isError = false) {
		const statusEl = document.getElementById("oauth-status");
		if (!statusEl) return;
		statusEl.textContent = text;
		statusEl.className = isError
			? "text-sm text-red-600 mb-4"
			: "text-sm text-gray-600 mb-4";
	}

	async function initiateOAuth(provider) {
		setOAuthStatus(`Requesting ${provider} login...`);
		try {
			const response = await fetch(`/api/auth/oauth/login?provider=${provider}`);
			const data = await response.json();
			if (!response.ok || data.status !== "success") {
				throw new Error(data.message || "Unable to build OAuth request");
			}
			window.open(data.auth_url, "_blank");
			setOAuthStatus(`Opened ${provider} login flow.`);
		} catch (error) {
			console.error("OAuth error", error);
			setOAuthStatus(`OAuth error: ${error.message}`, true);
		}
	}

	function displayTwoFactorMessage(text, success = false) {
		const messageEl = document.getElementById("2fa-message");
		if (!messageEl) return;
		messageEl.textContent = text;
		messageEl.className = success ? "mt-3 text-sm text-green-600" : "mt-3 text-sm text-red-600";
	}

	async function handleTwoFactorSetup() {
		const emailInput = document.getElementById("2fa-email");
		const email = emailInput ? emailInput.value.trim() : "";
		try {
			const response = await fetch("/api/auth/2fa-setup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			const data = await response.json();
			if (!response.ok || data.status !== "success") {
				throw new Error(data.message || "Failed to generate 2FA secret");
			}
			const qrWrapper = document.getElementById("qr-wrapper");
			const qrImage = document.getElementById("qr-image");
			if (qrImage) {
				qrImage.src = data.qr_code;
			}
			qrWrapper?.classList.remove("hidden");
			displayTwoFactorMessage("Scan the QR code and enter the next code.", false);
		} catch (error) {
			console.error("Failed to set up 2FA", error);
			displayTwoFactorMessage(`2FA setup error: ${error.message}`, false);
		}
	}

	async function handleTwoFactorVerify() {
		const codeInput = document.getElementById("2fa-code");
		const code = codeInput ? codeInput.value.trim() : "";
		if (!code) {
			displayTwoFactorMessage("Enter the 2FA code from your authenticator.", false);
			return;
		}
		try {
			const response = await fetch("/api/auth/2fa-verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code }),
			});
			const data = await response.json();
			if (!response.ok || data.status !== "success") {
				throw new Error(data.message || "Invalid 2FA code");
			}
			displayTwoFactorMessage("2FA verified. Session token stored locally.", true);
			console.log("2FA token:", data.token);
		} catch (error) {
			console.error("2FA verification failed", error);
			displayTwoFactorMessage(`2FA verification error: ${error.message}`, false);
		}
	}

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

		const googleOAuthBtn = document.getElementById("oauth-google-btn");
		const githubOAuthBtn = document.getElementById("oauth-github-btn");
		if (googleOAuthBtn) {
			googleOAuthBtn.addEventListener("click", () => initiateOAuth("google"));
		}
		if (githubOAuthBtn) {
			githubOAuthBtn.addEventListener("click", () => initiateOAuth("github"));
		}

		const setup2faButton = document.getElementById("setup-2fa-btn");
		if (setup2faButton) {
			setup2faButton.addEventListener("click", handleTwoFactorSetup);
		}

		const verify2faButton = document.getElementById("verify-2fa-btn");
		if (verify2faButton) {
			verify2faButton.addEventListener("click", handleTwoFactorVerify);
		}

		// Get the "Clean Up Resources" button
		const cleanupButton = document.getElementById("cleanup-btn");
		if (cleanupButton) {
			cleanupButton.addEventListener("click", async function () {
				try {
					// Fetch list of resources
					const response = await fetch("/api/cleanup/list");

					
					const data = await response.json();

					if (data.status !== "success" || !data.resources) {
						console.error("Error condition - status:", data.status, "has resources:", !!data.resources);
						alert("Error fetching resources:\n" + (data.message || "Unknown error"));
						return;
					}

					// Build resource list with checkboxes
					let resourceHTML = `📋 Resources in Resource Group: ${data.resource_group}\n\n`;
					resourceHTML += `Total Resources: ${data.count}\n\n`;
					resourceHTML += "Select resources to delete:\n\n";

					// Create a custom selection dialog
					const container = document.createElement("div");
					container.style.cssText = `
						position: fixed;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
						background: white;
						border: 2px solid #333;
						border-radius: 8px;
						padding: 20px;
						max-height: 80vh;
						max-width: 500px;
						overflow-y: auto;
						z-index: 10000;
						box-shadow: 0 4px 6px rgba(0,0,0,0.3);
					`;

					let html = `
						<h3 style="margin-top: 0; color: #d32f2f;">⚠️ Select Resources to Delete</h3>
						<p style="color: #666; font-size: 14px;">Resource Group: <strong>${data.resource_group}</strong></p>
						<p style="color: #666; font-size: 14px;">Total: ${data.count} resources</p>
						<div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
					`;

					data.resources.forEach((resource, index) => {
						const resourceName = resource.name;
						const resourceType = resource.type.split("/").pop();
						html += `
							<label style="display: block; margin: 8px 0; cursor: pointer;">
								<input type="checkbox" class="resource-checkbox" value="${resource.id}" style="margin-right: 8px;">
								<strong>${resourceName}</strong>
								<div style="color: #999; font-size: 12px; margin-left: 24px;">
									Type: ${resourceType}<br/>
									ID: ${resource.id.split("/").pop()}
								</div>
							</label>
						`;
					});

					html += `
						</div>
						<div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
							<button id="cancel-btn" style="padding: 8px 16px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
							<button id="delete-btn" style="padding: 8px 16px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete Selected</button>
						</div>
					`;

					container.innerHTML = html;
					document.body.appendChild(container);

					// Add overlay
					const overlay = document.createElement("div");
					overlay.style.cssText = `
						position: fixed;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						background: rgba(0,0,0,0.5);
						z-index: 9999;
					`;
					document.body.appendChild(overlay);

					// Cancel button
					document.getElementById("cancel-btn").addEventListener("click", () => {
						container.remove();
						overlay.remove();
					});

					// Delete button
					document.getElementById("delete-btn").addEventListener("click", async () => {
						const selected = Array.from(
							document.querySelectorAll(".resource-checkbox:checked")
						).map(cb => cb.value);

						if (selected.length === 0) {
							alert("Please select at least one resource to delete.");
							return;
						}

						const confirmed = confirm(
							`Are you sure you want to delete ${selected.length} resource(s)?\n\nThis action cannot be undone.`
						);

						if (!confirmed) return;

						// Show loading
						document.getElementById("delete-btn").disabled = true;
						document.getElementById("delete-btn").textContent = "Deleting...";

						try {
							const deleteResponse = await fetch("/api/cleanup/delete", {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
									"X-Cleanup-Confirm": "confirmed"
								},
								body: JSON.stringify({ resource_ids: selected })
							});

							const deleteData = await deleteResponse.json();

							let message = `Deletion Complete!\n\n`;
							message += `Successfully deleted: ${deleteData.deleted_count}\n`;
							if (deleteData.failed_count > 0) {
								message += `Failed: ${deleteData.failed_count}\n\n`;
								message += "Failed deletions:\n";
								deleteData.failed_resources.forEach(failed => {
									message += `- ${failed.resource_id}\n  Error: ${failed.error}\n`;
								});
							}

							alert(message);
							container.remove();
							overlay.remove();
						} catch (error) {
							alert(`Error deleting resources: ${error.message}`);
							document.getElementById("delete-btn").disabled = false;
							document.getElementById("delete-btn").textContent = "Delete Selected";
						}
					});
				} catch (error) {
					alert(`Error fetching resources: ${error.message}`);
				}
			});
		} else {
			console.warn("Clean Up Resources button not found");
		}
	});
})();
