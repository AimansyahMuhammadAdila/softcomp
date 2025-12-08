// Main JavaScript untuk aplikasi Flask Genetic Algorithm
// dengan support untuk flexible inputs dan detailed visualization

let fitnessChart = null;
let statsChart = null;
let diversityChart = null;
let eventSource = null;
let defaultConfig = null;

// Load default configuration pada page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadDefaultConfig();
    populateConfigForm();
    updateCurrentParams();
});

// Load default configuration dari backend
async function loadDefaultConfig() {
    try {
        const response = await fetch('/api/config');
        defaultConfig = await response.json();
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// Populate configuration form dengan default values
function populateConfigForm() {
    if (!defaultConfig) return;

    // Populate feeds table
    const feedsTableBody = document.getElementById('feedsTableBody');
    feedsTableBody.innerHTML = '';

    defaultConfig.feeds.forEach((feed, index) => {
        addFeedRow(feed);
    });

    // Set requirements (placeholders sudah diset di HTML)
    document.getElementById('reqPrdd').value = '';
    document.getElementById('reqMp').value = '';

    // Set GA parameters (placeholders sudah diset di HTML)
    document.getElementById('popSize').value = '';
    document.getElementById('maxGen').value = '';
    document.getElementById('crossoverRate').value = '';
    document.getElementById('mutationRate').value = '';
}

// Toggle configuration panel
function toggleConfig() {
    const content = document.getElementById('configContent');
    const toggle = document.getElementById('configToggle');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.classList.add('open');
    } else {
        content.style.display = 'none';
        toggle.classList.remove('open');
    }
}

// Add feed row to table
function addFeedRow(feed = null) {
    const tableBody = document.getElementById('feedsTableBody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td><input type="text" class="feed-name-input" value="${feed ? feed.name : ''}" placeholder="Nama pakan"></td>
        <td><input type="number" class="feed-price-input" value="${feed ? feed.price : ''}" placeholder="Harga" step="1"></td>
        <td><input type="number" class="feed-prdd-input" value="${feed ? feed.prdd : ''}" placeholder="PRDD" step="0.01"></td>
        <td><input type="number" class="feed-mp-input" value="${feed ? feed.mp : ''}" placeholder="MP" step="0.01"></td>
        <td><button class="btn-remove" onclick="removeFeedRow(this)">✕</button></td>
    `;

    tableBody.appendChild(row);
}

// Remove feed row
function removeFeedRow(button) {
    const row = button.closest('tr');
    const tableBody = document.getElementById('feedsTableBody');

    // Don't allow removing the last row
    if (tableBody.children.length > 1) {
        row.remove();
    } else {
        alert('Minimal harus ada 1 jenis pakan!');
    }
}

// Reset to default configuration
function resetToDefault() {
    if (confirm('Reset semua konfigurasi ke nilai default?')) {
        populateConfigForm();
        updateCurrentParams();
    }
}

// Collect feeds data from table
function collectFeedsData() {
    const rows = document.querySelectorAll('#feedsTableBody tr');
    const feeds = [];

    rows.forEach(row => {
        const name = row.querySelector('.feed-name-input').value.trim();
        const price = parseFloat(row.querySelector('.feed-price-input').value);
        const prdd = parseFloat(row.querySelector('.feed-prdd-input').value);
        const mp = parseFloat(row.querySelector('.feed-mp-input').value);

        if (name && !isNaN(price) && !isNaN(prdd) && !isNaN(mp)) {
            feeds.push({ name, price, prdd, mp });
        }
    });

    return feeds.length > 0 ? feeds : null;
}

// Collect all custom parameters
function collectCustomParams() {
    const params = {};

    // Feeds
    const feeds = collectFeedsData();
    if (feeds) params.feeds = feeds;

    // Requirements
    const reqPrdd = parseFloat(document.getElementById('reqPrdd').value);
    const reqMp = parseFloat(document.getElementById('reqMp').value);
    if (!isNaN(reqPrdd) && reqPrdd > 0) params.required_prdd = reqPrdd;
    if (!isNaN(reqMp) && reqMp > 0) params.required_mp = reqMp;

    // GA Parameters
    const popSize = parseInt(document.getElementById('popSize').value);
    const maxGen = parseInt(document.getElementById('maxGen').value);
    const crossoverRate = parseFloat(document.getElementById('crossoverRate').value);
    const mutationRate = parseFloat(document.getElementById('mutationRate').value);

    if (!isNaN(popSize) && popSize >= 10) params.pop_size = popSize;
    if (!isNaN(maxGen) && maxGen >= 10) params.max_gen = maxGen;
    if (!isNaN(crossoverRate) && crossoverRate >= 0 && crossoverRate <= 1) params.crossover_rate = crossoverRate;
    if (!isNaN(mutationRate) && mutationRate >= 0 && mutationRate <= 1) params.mutation_rate = mutationRate;

    return params;
}

// Update displayed current parameters
function updateCurrentParams() {
    const params = collectCustomParams();

    document.getElementById('displayPopSize').textContent = params.pop_size || defaultConfig?.parameters.pop_size || 100;
    document.getElementById('displayMaxGen').textContent = params.max_gen || defaultConfig?.parameters.max_gen || 200;
    document.getElementById('displayCrossover').textContent =
        ((params.crossover_rate || defaultConfig?.parameters.crossover_rate || 0.3) * 100).toFixed(0) + '%';
    document.getElementById('displayMutation').textContent =
        ((params.mutation_rate || defaultConfig?.parameters.mutation_rate || 0.3) * 100).toFixed(0) + '%';
}

// Update parameters display when inputs change
document.addEventListener('input', (e) => {
    if (e.target.closest('#configContent')) {
        updateCurrentParams();
    }
});

// Event listener untuk tombol start
document.getElementById('startBtn').addEventListener('click', async () => {
    const btn = document.getElementById('startBtn');

    // Collect custom parameters
    const customParams = collectCustomParams();

    // Disable button
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Sedang Berjalan...';

    // Show progress and chart sections
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('chartSection').style.display = 'block';
    document.getElementById('calculationSection').style.display = 'block';

    // Hide results section
    document.getElementById('resultsSection').style.display = 'none';

    // Reset progress
    resetProgress();

    // Initialize charts
    initCharts();

    // Start listening to progress FIRST
    listenToProgress();

    try {
        // Start algorithm (returns immediately)
        const startResponse = await fetch('/api/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customParams)
        });

        const startResult = await startResponse.json();
        console.log('Algorithm started:', startResult);

        // Poll for results
        const result = await pollForResult();

        // Stop listening to progress
        if (eventSource) {
            eventSource.close();
        }

        // Display results
        displayResults(result);

        // Display detailed calculations
        displayDetailedCalculations(result);

        // Re-enable button
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Mulai Optimasi';

    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menjalankan algoritma!');

        // Re-enable button
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Mulai Optimasi';

        if (eventSource) {
            eventSource.close();
        }
    }
});

// Poll for algorithm result
async function pollForResult() {
    return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/result');

                if (response.status === 200) {
                    const result = await response.json();
                    clearInterval(pollInterval);
                    resolve(result);
                } else if (response.status === 500) {
                    const error = await response.json();
                    clearInterval(pollInterval);
                    reject(new Error(error.error || 'Algorithm failed'));
                } else if (response.status === 202) {
                    // Still running, continue polling
                    console.log('Algorithm still running...');
                }
            } catch (error) {
                clearInterval(pollInterval);
                reject(error);
            }
        }, 500); // Poll every 500ms
    });
}

// Reset progress
function resetProgress() {
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').textContent = 'Generasi 0 / 200';
    document.getElementById('progressPercent').textContent = '0%';
    document.getElementById('currentFitness').textContent = '0.0000000000';
    document.getElementById('generationTableBody').innerHTML = '';
}

// Listen to progress updates via Server-Sent Events
function listenToProgress() {
    eventSource = new EventSource('/api/progress');

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateProgress(data);
    };

    eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
    };
}

// Update progress UI
function updateProgress(data) {
    const progressPercent = data.progress_percent.toFixed(1);

    document.getElementById('progressFill').style.width = progressPercent + '%';
    document.getElementById('progressText').textContent =
        `Generasi ${data.current_gen} / ${data.total_gen}`;
    document.getElementById('progressPercent').textContent = progressPercent + '%';
    document.getElementById('currentFitness').textContent =
        data.best_fitness.toFixed(10);
}

// Initialize all charts
function initCharts() {
    initFitnessChart();
    initStatsChart();
    initDiversityChart();
}

// Initialize main fitness chart
function initFitnessChart() {
    const ctx = document.getElementById('fitnessChart').getContext('2d');

    if (fitnessChart) {
        fitnessChart.destroy();
    }

    fitnessChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Best Fitness',
                data: [],
                borderColor: 'rgba(75, 172, 254, 1)',
                backgroundColor: 'rgba(75, 172, 254, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: getChartOptions('Fitness')
    });
}

// Initialize fitness statistics chart
function initStatsChart() {
    const ctx = document.getElementById('statsChart').getContext('2d');

    if (statsChart) {
        statsChart.destroy();
    }

    statsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Best',
                    data: [],
                    borderColor: 'rgba(75, 172, 254, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'Average',
                    data: [],
                    borderColor: 'rgba(240, 147, 251, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'Worst',
                    data: [],
                    borderColor: 'rgba(245, 87, 108, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }
            ]
        },
        options: getChartOptions('Fitness Value')
    });
}

// Initialize diversity chart
function initDiversityChart() {
    const ctx = document.getElementById('diversityChart').getContext('2d');

    if (diversityChart) {
        diversityChart.destroy();
    }

    diversityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Population Diversity',
                data: [],
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }]
        },
        options: getChartOptions('Diversity')
    });
}

// Get common chart options
function getChartOptions(yAxisLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0
        },
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: '#a0aec0',
                    font: { size: 11, family: 'Inter' }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 15, 35, 0.9)',
                titleColor: '#ffffff',
                bodyColor: '#a0aec0',
                borderColor: 'rgba(75, 172, 254, 0.5)',
                borderWidth: 1,
                padding: 10,
                displayColors: true
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#a0aec0',
                    font: { size: 10, family: 'Inter' }
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#a0aec0',
                    font: { size: 10, family: 'Inter' }
                },
                title: {
                    display: true,
                    text: yAxisLabel,
                    color: '#a0aec0'
                }
            }
        }
    };
}

// Display detailed calculations
function displayDetailedCalculations(result) {
    const detailedHistory = result.detailed_history;

    if (!detailedHistory || detailedHistory.length === 0) return;

    // Update statistics chart
    updateStatsChart(detailedHistory);

    // Update diversity chart
    updateDiversityChart(detailedHistory);

    // Update generation table
    updateGenerationTable(detailedHistory);
}

// Update stats chart with detailed history
function updateStatsChart(history) {
    if (!statsChart) return;

    const labels = history.map(item => item.gen);
    const bestData = history.map(item => item.best_fitness);
    const avgData = history.map(item => item.avg_fitness);
    const worstData = history.map(item => item.worst_fitness);

    statsChart.data.labels = labels;
    statsChart.data.datasets[0].data = bestData;
    statsChart.data.datasets[1].data = avgData;
    statsChart.data.datasets[2].data = worstData;
    statsChart.update('none');
}

// Update diversity chart
function updateDiversityChart(history) {
    if (!diversityChart) return;

    const labels = history.map(item => item.gen);
    const data = history.map(item => item.diversity);

    diversityChart.data.labels = labels;
    diversityChart.data.datasets[0].data = data;
    diversityChart.update('none');
}

// Update generation table
function updateGenerationTable(history) {
    const tbody = document.getElementById('generationTableBody');
    tbody.innerHTML = '';

    // Show only every 10th generation + first and last
    const sampled = history.filter((item, idx) =>
        idx === 0 || idx === history.length - 1 || idx % 10 === 0
    );

    sampled.forEach(gen => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${gen.gen}</td>
            <td>${gen.best_fitness.toFixed(8)}</td>
            <td>${gen.avg_fitness.toFixed(8)}</td>
            <td>${gen.worst_fitness.toFixed(8)}</td>
            <td>${gen.diversity.toFixed(4)}</td>
            <td>${gen.prdd.toFixed(4)}</td>
            <td>${gen.mp.toFixed(4)}</td>
            <td>${gen.cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</td>
        `;
        tbody.appendChild(row);
    });
}

// Update main fitness chart with full history
function updateFitnessChart(history) {
    if (!fitnessChart) return;

    const labels = history.map(item => item.gen);
    const data = history.map(item => item.fitness);

    fitnessChart.data.labels = labels;
    fitnessChart.data.datasets[0].data = data;
    fitnessChart.update('none');
}

// Display final results
function displayResults(result) {
    // Update main fitness chart
    updateFitnessChart(result.history);

    // Show results section
    document.getElementById('resultsSection').style.display = 'block';

    // Display composition table
    displayComposition(result.composition);

    // Display breakdown table
    displayBreakdown(result.composition);

    // Display totals with custom requirements
    displayTotals(result.totals, result.requirements);

    // Display final fitness
    document.getElementById('finalFitness').textContent = result.fitness.toFixed(10);

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Display composition table
function displayComposition(composition) {
    const container = document.getElementById('compositionTable');

    const maxWeight = Math.max(...composition.map(item => item.weight));

    let html = `
        <div class="composition-row header">
            <div>Bahan Pakan</div>
            <div style="text-align: right;">Berat (kg)</div>
            <div style="text-align: center;">Proporsi</div>
        </div>
    `;

    composition.forEach(item => {
        const barWidth = (item.weight / maxWeight) * 100;
        html += `
            <div class="composition-row">
                <div class="feed-name">${item.name}</div>
                <div class="feed-weight">${item.weight.toFixed(4)}</div>
                <div class="feed-bar-container">
                    <div class="feed-bar" style="width: ${barWidth}%"></div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Display breakdown table
function displayBreakdown(composition) {
    const container = document.getElementById('breakdownTable');

    let html = `
        <div class="breakdown-row header">
            <div>Bahan Pakan</div>
            <div class="breakdown-value">PRDD (kg)</div>
            <div class="breakdown-value">MP (kg)</div>
            <div class="breakdown-value">Biaya (Rp)</div>
            <div class="breakdown-value">Harga/kg (Rp)</div>
        </div>
    `;

    composition.forEach(item => {
        html += `
            <div class="breakdown-row">
                <div>${item.name}</div>
                <div class="breakdown-value">${item.total_prdd.toFixed(4)}</div>
                <div class="breakdown-value">${item.total_mp.toFixed(4)}</div>
                <div class="breakdown-value highlight">${item.total_cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</div>
                <div class="breakdown-value">${item.price.toLocaleString('id-ID')}</div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Display totals and check constraints
function displayTotals(totals, requirements) {
    // Update target displays
    document.getElementById('targetPrdd').textContent = `Target: ${requirements.prdd} kg`;
    document.getElementById('targetMp').textContent = `Target: ${requirements.mp} kg`;

    // PRDD
    document.getElementById('totalPrdd').textContent = totals.prdd.toFixed(4);
    const prddStatus = document.getElementById('prddStatus');
    if (totals.prdd >= requirements.prdd) {
        prddStatus.textContent = '✓ Memenuhi kebutuhan';
        prddStatus.className = 'metric-status success';
    } else {
        prddStatus.textContent = '✗ Kurang dari kebutuhan';
        prddStatus.className = 'metric-status warning';
    }

    // MP
    document.getElementById('totalMp').textContent = totals.mp.toFixed(4);
    const mpStatus = document.getElementById('mpStatus');
    if (totals.mp >= requirements.mp) {
        mpStatus.textContent = '✓ Memenuhi kebutuhan';
        mpStatus.className = 'metric-status success';
    } else {
        mpStatus.textContent = '✗ Kurang dari kebutuhan';
        mpStatus.className = 'metric-status warning';
    }

    // Cost
    document.getElementById('totalCost').textContent =
        totals.cost.toLocaleString('id-ID', { maximumFractionDigits: 2 });
}
