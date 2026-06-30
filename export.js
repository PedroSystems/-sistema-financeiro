/**
 * EXPORT - Funções de exportação
 */

// Extendendo o FinanceSystem
FinanceSystem.prototype.exportToJSON = function() {
    const data = {
        transactions: this.transactions,
        categories: this.categories,
        goals: this.goals,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('📦 Dados exportados com sucesso!');
};

FinanceSystem.prototype.generateExcel = function() {
    // Criar CSV simples
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
    const rows = this.transactions.map(t => [
        t.date,
        t.description,
        this.getCategoryName(t.category),
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount.toFixed(2)
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('📊 Excel exportado com sucesso!');
};

FinanceSystem.prototype.generatePDF = function() {
    // Versão simplificada - cria uma página HTML para impressão
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const totalIncome = this.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = this.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    let html = `
        <html>
        <head>
            <title>Relatório Financeiro</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; background: white; color: black; }
                h1 { color: #00b894; }
                .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 20px 0; }
                .summary-item { padding: 16px; border: 1px solid #ddd; border-radius: 8px; }
                .summary-item .label { font-size: 14px; color: #666; }
                .summary-item .value { font-size: 24px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                th { background: #f5f5f5; }
                .income { color: #00b894; }
                .expense { color: #ff6b6b; }
            </style>
        </head>
        <body>
            <h1>📊 Relatório Financeiro</h1>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            
            <div class="summary">
                <div class="summary-item">
                    <div class="label">Total Receitas</div>
                    <div class="value income">${this.formatCurrency(totalIncome)}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Total Despesas</div>
                    <div class="value expense">${this.formatCurrency(totalExpense)}</div>
                </div>
                <div class="summary-item">
                    <div class="label">Saldo</div>
                    <div class="value" style="color: ${balance >= 0 ? '#00b894' : '#ff6b6b'}">${this.formatCurrency(balance)}</div>
                </div>
            </div>

            <h2>Transações</h2>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
    `;

    this.transactions.sort((a, b) => b.date.localeCompare(a.date)).forEach(t => {
        html += `
            <tr>
                <td>${this.formatDate(t.date)}</td>
                <td>${t.description}</td>
                <td>${this.getCategoryName(t.category)}</td>
                <td class="${t.type}">${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
                <td class="${t.type}">${this.formatCurrency(t.amount)}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
                Total de transações: ${this.transactions.length}
            </p>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    this.showToast('📄 PDF gerado com sucesso!');
};
