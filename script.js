/**
 * DASHBOARD - Gráficos e resumos
 */

// Extendendo o FinanceSystem
FinanceSystem.prototype.renderDashboard = function() {
    this.updateDashboardCharts();
    this.updateGoalsProgress();
};

FinanceSystem.prototype.updateDashboardCharts = function() {
    this.updateIncomeExpenseChart();
    this.updateCategoryChart();
    this.updateEvolutionChart();
};

FinanceSystem.prototype.updateIncomeExpenseChart = function() {
    const ctx = document.getElementById('incomeExpenseChart');
    if (!ctx) return;

    const now = new Date();
    const months = [];
    const incomes = [];
    const expenses = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        months.push(monthName);
        
        const monthTransactions = this.transactions.filter(t => 
            t.date.startsWith(monthKey)
        );
        
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        incomes.push(income);
        expenses.push(expense);
    }

    if (this.incomeExpenseChart) {
        this.incomeExpenseChart.destroy();
    }

    this.incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Receitas',
                    data: incomes,
                    backgroundColor: 'rgba(0, 184, 148, 0.6)',
                    borderColor: '#00b894',
                    borderWidth: 2,
                    borderRadius: 4,
                },
                {
                    label: 'Despesas',
                    data: expenses,
                    backgroundColor: 'rgba(255, 107, 107, 0.6)',
                    borderColor: '#ff6b6b',
                    borderWidth: 2,
                    borderRadius: 4,
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

FinanceSystem.prototype.updateCategoryChart = function() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const expenses = this.transactions.filter(t => t.type === 'expense');
    const categoryMap = {};

    expenses.forEach(t => {
        const catName = this.getCategoryName(t.category);
        categoryMap[catName] = (categoryMap[catName] || 0) + t.amount;
    });

    const categories = Object.keys(categoryMap);
    const values = Object.values(categoryMap);
    const colors = [
        '#ff6b6b', '#fdcb6e', '#00b894', '#00cec9', '#6c5ce7',
        '#fd79a8', '#e17055', '#0984e3', '#fdcb6e', '#00b894'
    ];

    if (this.categoryChart) {
        this.categoryChart.destroy();
    }

    this.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, categories.length),
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim(),
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(),
                        font: { size: 11 },
                        padding: 16
                    }
                }
            }
        }
    });
};

FinanceSystem.prototype.updateEvolutionChart = function() {
    const ctx = document.getElementById('evolutionChart');
    if (!ctx) return;

    // Group by month
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

    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(m => {
        const [year, month] = m.split('-');
        return new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    });

    const balances = sortedMonths.map(m => {
        const data = monthlyData[m];
        return data.income - data.expense;
    });

    if (this.evolutionChart) {
        this.evolutionChart.destroy();
    }

    this.evolutionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Evolução do Saldo',
                data: balances,
                borderColor: '#00b894',
                backgroundColor: 'rgba(0, 184, 148, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00b894',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
            }]
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

FinanceSystem.prototype.updateGoalsProgress = function() {
    if (this.goals.length === 0) {
        document.getElementById('goalsProgress').textContent = '0%';
        return;
    }

    const completed = this.goals.filter(g => g.current >= g.target).length;
    const percentage = Math.round((completed / this.goals.length) * 100);
    document.getElementById('goalsProgress').textContent = `${percentage}%`;
};