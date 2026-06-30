/**
 * CATEGORIAS - CRUD e gerenciamento
 */

// Extendendo o FinanceSystem
FinanceSystem.prototype.renderCategoryList = function() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    const incomeCategories = this.categories.filter(c => c.type === 'income');
    const expenseCategories = this.categories.filter(c => c.type === 'expense');

    let html = '<div style="grid-column: 1/-1;"><h3>Receitas</h3></div>';
    html += incomeCategories.map(c => this.createCategoryCard(c)).join('');
    
    html += '<div style="grid-column: 1/-1; margin-top: 20px;"><h3>Despesas</h3></div>';
    html += expenseCategories.map(c => this.createCategoryCard(c)).join('');

    container.innerHTML = html;
};

FinanceSystem.prototype.createCategoryCard = function(category) {
    const typeLabel = category.type === 'income' ? 'Receita' : 'Despesa';
    const typeClass = category.type === 'income' ? 'income' : 'expense';

    return `
        <div class="category-card">
            <div class="category-icon"><i class="${category.icon || 'fa-solid fa-tag'}"></i></div>
            <div class="category-name">${category.name}</div>
            <div class="category-type ${typeClass}">${typeLabel}</div>
            <div class="category-actions">
                <button onclick="finance.editCategory('${category.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-category" onclick="finance.deleteCategory('${category.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
};

// Category CRUD
FinanceSystem.prototype.addCategory = function(data) {
    const category = {
        id: this.generateId(),
        ...data
    };
    this.categories.push(category);
    this.saveData();
    this.renderAll();
    this.updateCategoriesSelect();
    this.showToast('✅ Categoria adicionada!');
};

FinanceSystem.prototype.editCategory = function(id) {
    const category = this.categories.find(c => c.id === id);
    if (category) {
        this.openCategoryForm(category);
    }
};

FinanceSystem.prototype.updateCategory = function(id, data) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
        this.categories[index] = { ...this.categories[index], ...data };
        this.saveData();
        this.renderAll();
        this.updateCategoriesSelect();
        this.showToast('✅ Categoria atualizada!');
    }
};

FinanceSystem.prototype.deleteCategory = function(id) {
    const hasTransactions = this.transactions.some(t => t.category === id);
    if (hasTransactions) {
        this.showToast('⚠️ Não é possível excluir: categoria possui transações', 'error');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        this.categories = this.categories.filter(c => c.id !== id);
        this.saveData();
        this.renderAll();
        this.updateCategoriesSelect();
        this.showToast('🗑️ Categoria excluída');
    }
};

// Modal
FinanceSystem.prototype.openCategoryForm = function(data = null) {
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const title = document.getElementById('categoryModalTitle');

    if (data) {
        title.textContent = 'Editar Categoria';
        document.getElementById('categoryName').value = data.name;
        document.getElementById('categoryType').value = data.type;
        document.getElementById('categoryIcon').value = data.icon || '';
        form.dataset.id = data.id;
    } else {
        title.textContent = 'Nova Categoria';
        form.reset();
        delete form.dataset.id;
    }

    modal.classList.add('active');
};

// Form submit
document.getElementById('categoryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('categoryName').value.trim(),
        type: document.getElementById('categoryType').value,
        icon: document.getElementById('categoryIcon').value.trim() || 'fa-solid fa-tag'
    };

    if (!data.name) {
        finance.showToast('⚠️ Digite o nome da categoria', 'error');
        return;
    }

    if (this.dataset.id) {
        finance.updateCategory(this.dataset.id, data);
    } else {
        finance.addCategory(data);
    }

    document.getElementById('categoryModal').classList.remove('active');
});

// Cancel
document.getElementById('cancelCategory').addEventListener('click', () => {
    document.getElementById('categoryModal').classList.remove('active');
});