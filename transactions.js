/**
 * TRANSAÇÕES - CRUD e listagem
 */

// Extendendo o FinanceSystem
FinanceSystem.prototype.renderTransactionList = function() {
    const container = document.getElementById('transactionsContainer');
    if (!container) return;

    const filtered = this.getFilteredTransactions();
    const total = filtered.length;
    const totalPages = Math.ceil(total / this.transactionsPerPage);
    const start = (this.transactionPage - 1) * this.transactionsPerPage;
    const end = start + this.transactionsPerPage;
    const pageItems = filtered.slice(start, end);

    document.getElementById('transactionsCount').textContent = `${total} transações`;

    if (pageItems.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p style="font-size: 16px;">Nenhuma transação encontrada</p>
                <p style="font-size: 14px;">Clique em "Nova Transação" para começar</p>
            </div>
        `;
        this.updatePagination(totalPages);
        return;
    }

    container.innerHTML = pageItems.map(t => `
        <div class="transaction-item" data-id="${t.id}">
            <span class="date">${this.formatDate(t.date)}</span>
            <span class="description">${t.description}</span>
            <span class="category">${this.getCategoryName(t.category)}</span>
            <span class="type ${t.type}">${t.type === 'income' ? 'Receita' : 'Despesa'}</span>
            <span class="amount ${t.type}">${this.formatCurrency(t.amount)}</span>
            <span class="actions">
                <button onclick="finance.editTransaction('${t.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="finance.deleteTransaction('${t.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </span>
        </div>
    `).join('');

    this.updatePagination(totalPages);
};

FinanceSystem.prototype.getFilteredTransactions = function() {
    let filtered = [...this.transactions];

    // Type filter
    const typeFilter = document.getElementById('transactionType').value;
    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Category filter
    const categoryFilter = document.getElementById('transactionCategory').value;
    if (categoryFilter) {
        filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Date range
    const dateFrom = document.getElementById('transactionDateFrom').value;
    const dateTo = document.getElementById('transactionDateTo').value;
    if (dateFrom) {
        filtered = filtered.filter(t => t.date >= dateFrom);
    }
    if (dateTo) {
        filtered = filtered.filter(t => t.date <= dateTo);
    }

    // Search
    const search = document.getElementById('transactionSearch').value.toLowerCase();
    if (search) {
        filtered = filtered.filter(t => 
            t.description.toLowerCase().includes(search) ||
            this.getCategoryName(t.category).toLowerCase().includes(search)
        );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.localeCompare(a.date));

    return filtered;
};

FinanceSystem.prototype.updatePagination = function(totalPages) {
    document.getElementById('pageInfo').textContent = `Página ${this.transactionPage} de ${totalPages || 1}`;
    document.getElementById('prevPage').disabled = this.transactionPage <= 1;
    document.getElementById('nextPage').disabled = this.transactionPage >= totalPages;
};

// Transaction CRUD
FinanceSystem.prototype.addTransaction = function(data) {
    const transaction = {
        id: this.generateId(),
        ...data,
        date: data.date || new Date().toISOString().split('T')[0]
    };
    this.transactions.push(transaction);
    this.saveData();
    this.renderAll();
    this.updateUI();
    this.showToast('✅ Transação adicionada com sucesso!');
};

FinanceSystem.prototype.editTransaction = function(id) {
    const transaction = this.transactions.find(t => t.id === id);
    if (transaction) {
        this.openTransactionModal(transaction);
    }
};

FinanceSystem.prototype.updateTransaction = function(id, data) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        this.transactions[index] = { ...this.transactions[index], ...data };
        this.saveData();
        this.renderAll();
        this.updateUI();
        this.showToast('✅ Transação atualizada!');
    }
};

FinanceSystem.prototype.deleteTransaction = function(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveData();
        this.renderAll();
        this.updateUI();
        this.showToast('🗑️ Transação excluída');
    }
};

// Modal
FinanceSystem.prototype.openTransactionForm = function(data = null) {
    const modal = document.getElementById('transactionModal');
    const form = document.getElementById('transactionForm');
    const title = document.getElementById('transactionModalTitle');

    if (data) {
        title.textContent = 'Editar Transação';
        document.getElementById('transactionDescription').value = data.description;
        document.getElementById('transactionAmount').value = data.amount;
        document.getElementById('transactionTypeSelect').value = data.type;
        document.getElementById('transactionCategorySelect').value = data.category;
        document.getElementById('transactionDate').value = data.date;
        form.dataset.id = data.id;
    } else {
        title.textContent = 'Nova Transação';
        form.reset();
        document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
        delete form.dataset.id;
    }

    this.updateCategoriesSelect();
    modal.classList.add('active');
};

// Form submit
document.getElementById('transactionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const data = {
        description: document.getElementById('transactionDescription').value.trim(),
        amount: parseFloat(document.getElementById('transactionAmount').value),
        type: document.getElementById('transactionTypeSelect').value,
        category: document.getElementById('transactionCategorySelect').value,
        date: document.getElementById('transactionDate').value
    };

    if (!data.description || !data.amount || !data.category) {
        finance.showToast('⚠️ Preencha todos os campos obrigatórios', 'error');
        return;
    }

    if (this.dataset.id) {
        finance.updateTransaction(this.dataset.id, data);
    } else {
        finance.addTransaction(data);
    }

    document.getElementById('transactionModal').classList.remove('active');
});

// Cancel
document.getElementById('cancelTransaction').addEventListener('click', () => {
    document.getElementById('transactionModal').classList.remove('active');
});

// Filters events
document.getElementById('transactionType').addEventListener('change', () => {
    finance.renderTransactions();
});

document.getElementById('transactionCategory').addEventListener('change', () => {
    finance.renderTransactions();
});

document.getElementById('transactionDateFrom').addEventListener('change', () => {
    finance.renderTransactions();
});

document.getElementById('transactionDateTo').addEventListener('change', () => {
    finance.renderTransactions();
});

document.getElementById('transactionSearch').addEventListener('input', () => {
    finance.renderTransactions();
});

// Pagination
document.getElementById('prevPage').addEventListener('click', () => {
    if (finance.transactionPage > 1) {
        finance.transactionPage--;
        finance.renderTransactions();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    finance.transactionPage++;
    finance.renderTransactions();
});