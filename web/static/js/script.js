document.addEventListener('DOMContentLoaded', () => {
    const addFeedBtn = document.getElementById('add-feed-btn');
    const feedTableBody = document.querySelector('#feed-table tbody');
    const optimizeBtn = document.getElementById('optimize-btn');
    const resultsSection = document.getElementById('results-section');
    const advancedToggle = document.getElementById('advanced-settings-toggle');
    const advancedContent = document.getElementById('advanced-settings-content');

    // Splash Screen
    const splashScreen = document.getElementById('splash-screen');
    setTimeout(() => {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 500);
    }, 2000);

    // Modal Logic
    const modal = document.getElementById('calc-modal');
    const showDetailsBtn = document.getElementById('show-details-btn');
    const closeModalBtn = document.querySelector('.close-modal');

    if (showDetailsBtn) {
        showDetailsBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Accordion Toggle
    advancedToggle.addEventListener('click', () => {
        advancedToggle.classList.toggle('active');
        advancedContent.classList.toggle('active');
        const icon = advancedToggle.querySelector('.arrow');
        icon.style.transform = advancedToggle.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // Add Feed Row
    addFeedBtn.addEventListener('click', () => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="feed-name" value="Bahan Baru"></td>
            <td><input type="number" class="feed-price" value="0"></td>
            <td><input type="number" class="feed-prdd" step="0.01" value="0"></td>
            <td><input type="number" class="feed-mp" step="0.01" value="0"></td>
            <td><button class="btn-icon delete-row"><i class="fa-solid fa-trash"></i></button></td>
        `;
        row.style.animation = 'fadeIn 0.5s ease-out';
        feedTableBody.appendChild(row);
        attachDeleteEvent(row.querySelector('.delete-row'));
    });

    function attachDeleteEvent(btn) {
        btn.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            row.style.transform = 'translateX(50px)';
            row.style.opacity = '0';
            setTimeout(() => row.remove(), 300);
        });
    }

    document.querySelectorAll('.delete-row').forEach(attachDeleteEvent);

    // Optimize
    optimizeBtn.addEventListener('click', async () => {
        const feeds = [];
        document.querySelectorAll('#feed-table tbody tr').forEach(row => {
            feeds.push({
                name: row.querySelector('.feed-name').value,
                price: parseFloat(row.querySelector('.feed-price').value) || 0,
                prdd: parseFloat(row.querySelector('.feed-prdd').value) || 0,
                mp: parseFloat(row.querySelector('.feed-mp').value) || 0
            });
        });

        const data = {
            feeds: feeds,
            required_prdd: parseFloat(document.getElementById('required_prdd').value),
            required_mp: parseFloat(document.getElementById('required_mp').value),
            pop_size: parseInt(document.getElementById('pop_size').value),
            max_gen: parseInt(document.getElementById('max_gen').value),
            crossover_rate: parseFloat(document.getElementById('crossover_rate').value),
            mutation_rate: parseFloat(document.getElementById('mutation_rate').value)
        };

        const btnText = optimizeBtn.querySelector('.btn-text');
        const loader = optimizeBtn.querySelector('.loader');
        btnText.textContent = 'Memproses...';
        loader.classList.remove('hidden');
        optimizeBtn.disabled = true;

        try {
            const response = await fetch('/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            setTimeout(() => {
                displayResults(result, data.required_prdd, data.required_mp);
                resultsSection.classList.remove('hidden');
                resultsSection.style.animation = 'none';
                resultsSection.offsetHeight;
                resultsSection.style.animation = 'fadeIn 0.8s ease-out forwards';
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                btnText.textContent = 'Jalankan Optimasi';
                loader.classList.add('hidden');
                optimizeBtn.disabled = false;
            }, 800);

        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat melakukan optimasi.');
            btnText.textContent = 'Jalankan Optimasi';
            loader.classList.add('hidden');
            optimizeBtn.disabled = false;
        }
    });

    function displayResults(result, targetPrdd, targetMp) {
        animateValue(document.getElementById('total-cost'), 0, result.totals.cost, 1500, true);
        animateValue(document.getElementById('total-weight'), 0, result.totals.weight, 1500, false, ' kg');
        animateValue(document.getElementById('best-fitness'), 0, result.fitness, 1500, false);

        const prddPct = Math.min(100, (result.totals.prdd / targetPrdd) * 100);
        const mpPct = Math.min(100, (result.totals.mp / targetMp) * 100);

        document.getElementById('prdd-val').textContent = `${result.totals.prdd.toFixed(3)} / ${targetPrdd} kg`;
        document.getElementById('prdd-bar').style.width = '0%';
        setTimeout(() => { document.getElementById('prdd-bar').style.width = `${prddPct}%`; }, 100);

        document.getElementById('mp-val').textContent = `${result.totals.mp.toFixed(3)} / ${targetMp} kg`;
        document.getElementById('mp-bar').style.width = '0%';
        setTimeout(() => { document.getElementById('mp-bar').style.width = `${mpPct}%`; }, 300);

        // Composition Table
        const tbody = document.querySelector('#result-table tbody');
        tbody.innerHTML = '';
        result.composition.forEach((item, index) => {
            if (item.amount > 0.0001) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.amount.toFixed(3)}</td>
                    <td>${item.weight_percentage.toFixed(1)}%</td>
                    <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                    <td>Rp ${item.cost.toLocaleString('id-ID')}</td>
                    <td>${item.cost_percentage.toFixed(1)}%</td>
                    <td>${item.prdd_contribution.toFixed(4)}</td>
                    <td>${item.mp_contribution.toFixed(4)}</td>
                `;
                tbody.appendChild(row);
            }
        });

        // Generation History Table
        const historyTbody = document.querySelector('#history-table tbody');
        historyTbody.innerHTML = '';
        result.history.forEach((h, index) => {
            if (index === 0 || index === result.history.length - 1 || h.generation % 10 === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${h.generation}</td>
                    <td>${h.best_fitness.toFixed(6)}</td>
                    <td>${h.avg_fitness.toFixed(6)}</td>
                    <td>Rp ${h.best_cost.toLocaleString('id-ID')}</td>
                `;
                historyTbody.appendChild(row);
            }
        });

        // Top 5 Solutions - TABLE FORMAT
        const topSolutionsContainer = document.getElementById('top-solutions-container');
        const medalIcons = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

        let tableHTML = `
            <div class="table-container">
                <table class="top-solutions-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Total Biaya</th>
                            <th>Fitness</th>
                            <th>Prdd (kg)</th>
                            <th>MP (kg)</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>`;

        result.top_solutions.forEach((sol, idx) => {
            tableHTML += `
                <tr>
                    <td><span class="rank-badge rank-${idx + 1}">${medalIcons[idx]} #${sol.rank}</span></td>
                    <td><strong class="cost-highlight">Rp ${sol.totals.cost.toLocaleString('id-ID')}</strong></td>
                    <td><span class="fitness-badge">${sol.fitness.toFixed(6)}</span></td>
                    <td>${sol.totals.prdd.toFixed(3)}</td>
                    <td>${sol.totals.mp.toFixed(3)}</td>
                    <td>
                        <button class="btn-small toggle-solution" data-index="${idx}">
                            <i class="fa-solid fa-eye"></i> Detail
                        </button>
                    </td>
                </tr>
                <tr class="solution-detail-row hidden" id="detail-row-${idx}">
                    <td colspan="6">
                        <div class="solution-detail-content">
                            <h4>Komposisi Solusi #${sol.rank}</h4>
                            <table class="detail-table">
                                <thead>
                                    <tr>
                                        <th>Bahan</th>
                                        <th>Jumlah (kg)</th>
                                        <th>Biaya</th>
                                    </tr>
                                </thead>
                                <tbody>`;

            sol.composition.filter(c => c.amount > 0.0001).forEach(c => {
                tableHTML += `
                                    <tr>
                                        <td>${c.name}</td>
                                        <td>${c.amount.toFixed(3)}</td>
                                        <td>Rp ${c.cost.toLocaleString('id-ID')}</td>
                                    </tr>`;
            });

            tableHTML += `
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>`;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>`;

        topSolutionsContainer.innerHTML = tableHTML;

        // Add toggle event listeners
        document.querySelectorAll('.toggle-solution').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                const detailRow = document.getElementById(`detail-row-${index}`);
                const icon = e.currentTarget.querySelector('i');

                detailRow.classList.toggle('hidden');
                icon.className = detailRow.classList.contains('hidden') ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
            });
        });
    }

    function animateValue(obj, start, end, duration, isCurrency, suffix = '') {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = progress * (end - start) + start;

            if (isCurrency) {
                obj.textContent = `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
            } else {
                obj.textContent = value.toFixed(suffix ? 2 : 6) + suffix;
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
