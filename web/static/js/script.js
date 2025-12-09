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
    }, 2000); // 2 seconds splash

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

    // Close modal when clicking outside
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

    // Delete Feed Row
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
        // Collect Data
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

        // UI Loading State
        const btnText = optimizeBtn.querySelector('.btn-text');
        const loader = optimizeBtn.querySelector('.loader');
        btnText.textContent = 'Memproses...';
        loader.classList.remove('hidden');
        optimizeBtn.disabled = true;

        try {
            const response = await fetch('/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            // Artificial delay for effect
            setTimeout(() => {
                displayResults(result, data.required_prdd, data.required_mp);
                resultsSection.classList.remove('hidden');
                resultsSection.style.animation = 'none';
                resultsSection.offsetHeight; /* trigger reflow */
                resultsSection.style.animation = 'fadeIn 0.8s ease-out forwards';

                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                btnText.textContent = 'Jalankan Optimasi AI';
                loader.classList.add('hidden');
                optimizeBtn.disabled = false;
            }, 800);

        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat melakukan optimasi.');
            btnText.textContent = 'Jalankan Optimasi AI';
            loader.classList.add('hidden');
            optimizeBtn.disabled = false;
        }
    });

    function displayResults(result, targetPrdd, targetMp) {
        // Animate Numbers
        animateValue(document.getElementById('total-cost'), 0, result.totals.cost, 1500, true);
        animateValue(document.getElementById('best-fitness'), 0, result.fitness, 1500, false);

        // Progress Bars
        const prddPct = Math.min(100, (result.totals.prdd / targetPrdd) * 100);
        const mpPct = Math.min(100, (result.totals.mp / targetMp) * 100);

        document.getElementById('prdd-val').textContent = `${result.totals.prdd.toFixed(3)} / ${targetPrdd} kg`;
        document.getElementById('prdd-bar').style.width = '0%';
        setTimeout(() => {
            document.getElementById('prdd-bar').style.width = `${prddPct}%`;
        }, 100);

        document.getElementById('mp-val').textContent = `${result.totals.mp.toFixed(3)} / ${targetMp} kg`;
        document.getElementById('mp-bar').style.width = '0%';
        setTimeout(() => {
            document.getElementById('mp-bar').style.width = `${mpPct}%`;
        }, 300);

        // Composition Table
        const tbody = document.querySelector('#result-table tbody');
        tbody.innerHTML = '';

        result.composition.forEach((item, index) => {
            if (item.amount > 0.0001) {
                const row = document.createElement('tr');
                row.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s forwards`;
                row.style.opacity = '0';
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.amount.toFixed(3)}</td>
                    <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                    <td>Rp ${item.cost.toLocaleString('id-ID')}</td>
                `;
                tbody.appendChild(row);
            }
        });
    }

    function animateValue(obj, start, end, duration, isCurrency) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = progress * (end - start) + start;

            if (isCurrency) {
                obj.textContent = `Rp ${value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
            } else {
                obj.textContent = value.toFixed(6);
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
