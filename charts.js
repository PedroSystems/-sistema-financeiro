/**
 * GRÁFICOS - Inicialização e atualização dos charts
 */

// Já implementado em dashboard.js, mas vamos adicionar o método de report
FinanceSystem.prototype.renderReportData = function() {
    const totalIncome = this.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = this.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const savings = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;

    document.getElementById('reportIncome').textContent = this.formatCurrency(totalIncome);
    document.getElementById('reportExpense').textContent = this.formatCurrency(totalExpense);
    document.getElementById('reportBalance').textContent = this.formatCurrency(balance);
    document.getElementById('reportSavings').textContent = `${savings.toFixed(1)}%`;

    // Top 5 expense categories
    const expenses = this.transactions.filter(t => t.type === 'expense');
    const categoryMap = {};
    expenses.forEach(t => {
        const catName = this.getCategoryName(t.category);
        categoryMap[catName] = (categoryMap[catName] || 0) + t.amount;
    });

    const sortedCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const topCategoriesContainer = document.getElementById('topCategoriesList');
    if (sortedCategories.length === 0) {
        topCategoriesContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Nenhuma despesa registrada</p>';
    } else {
        topCategoriesContainer.innerHTML = sortedCategories.map(([name, amount]) => `
            <div class="top-category-item">
                <span class="category-name">${name}</span>
                <span class="category-amount">${this.formatCurrency(amount)}</span>
            </div>
        `).join('');
    }

    // Report chart
    this.updateReportChart();
};

FinanceSystem.prototype.updateReportChart = function() {
    const ctx = document.getElementById('reportChart');
    if (!ctx) return;

    const monthlyData = {};
    this.transactions.forEach(t => {
        const month = t.date.substring(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            monthlyData[month].income += t.amount;
        } else {
            monthlyData[month].expense += t.amount;
        }
    });

    const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
    const labels = sortedMonths.map(m => {
        const [year, month] = m.split('-');
        return new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'short' });
    });

    const incomes = sortedMonths.map(m => monthlyData[m].income);
    const expenses = sortedMonths.map(m => monthlyData[m].expense);

    if (this.reportChart) {
        this.reportChart.destroy();
    }

    this.reportChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: incomes,
                    borderColor: '#00b894',
                    backgroundColor: 'rgba(0, 184, 148, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Despesas',
                    data: expenses,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    fill: true,
                    tension: 0.4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(),
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim()
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim(),
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
};