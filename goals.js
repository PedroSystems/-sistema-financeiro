/**
 * METAS - CRUD e gerenciamento
 */

// Extendendo o FinanceSystem
FinanceSystem.prototype.renderGoalList = function() {
    const container = document.getElementById('goalsContainer');
    if (!container) return;

    if (this.goals.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <i class="fas fa-bullseye" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                <p style="font-size: 16px;">Nenhuma meta definida</p>
                <p style="font-size: 14px;">Clique em "Nova Meta" para começar a planejar</p>
            </div>
        `;
        return;
    }

    container.innerHTML = this.goals.map(goal => {
        const progress = Math.min((goal.current / goal.target) * 100, 100);
        const status = progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending';
        const statusLabel = status === 'completed' ? '✅ Concluída' : 
                           status === 'in-progress' ? '🔄 Em andamento' : '⏳ Pendente';

        return `
            <div class="goal-card">
                <div class="goal-header">
                    <div class="goal-name">${goal.name}</div>
                    <div class="goal-actions">
                        <button onclick="finance.editGoal('${goal.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="finance.deleteGoal('${goal.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="goal-progress">
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="goal-info">
                    <span>Progresso</span>
                    <strong>${progress.toFixed(0)}%</strong>
                    <span>Valor Atual</span>
                    <strong>${finance.formatCurrency(goal.current)}</strong>
                    <span>Meta</span>
                    <strong>${finance.formatCurrency(goal.target)}</strong>
                    <span>Prazo</span>
                    <strong>${finance.formatDate(goal.deadline)}</strong>
                </div>
                <div class="goal-status ${status}">${statusLabel}</div>
            </div>
        `;
    }).join('');
};

// Goal CRUD
FinanceSystem.prototype.addGoal = function(data) {
    const goal = {
        id: this.generateId(),
        ...data,
        current: data.current || 0
    };
    this.goals.push(goal);
    this.saveData();
    this.renderAll();
    this.showToast('🎯 Meta criada com sucesso!');
};

FinanceSystem.prototype.editGoal = function(id) {
    const goal = this.goals.find(g => g.id === id);
    if (goal) {
        this.openGoalForm(goal);
    }
};

FinanceSystem.prototype.updateGoal = function(id, data) {
    const index = this.goals.findIndex(g => g.id === id);
    if (index !== -1) {
        this.goals[index] = { ...this.goals[index], ...data };
        this.saveData();
        this.renderAll();
        this.showToast('✅ Meta atualizada!');
    }
};

FinanceSystem.prototype.deleteGoal = function(id) {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
        this.goals = this.goals.filter(g => g.id !== id);
        this.saveData();
        this.renderAll();
        this.showToast('🗑️ Meta excluída');
    }
};

// Modal
FinanceSystem.prototype.openGoalForm = function(data = null) {
    const modal = document.getElementById('goalModal');
    const form = document.getElementById('goalForm');
    const title = document.getElementById('goalModalTitle');

    if (data) {
        title.textContent = 'Editar Meta';
        document.getElementById('goalName').value = data.name;
        document.getElementById('goalTarget').value = data.target;
        document.getElementById('goalCurrent').value = data.current || 0;
        document.getElementById('goalDeadline').value = data.deadline;
        form.dataset.id = data.id;
    } else {
        title.textContent = 'Nova Meta';
        form.reset();
        document.getElementById('goalCurrent').value = 0;
        delete form.dataset.id;
    }

    modal.classList.add('active');
};

// Form submit
document.getElementById('goalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('goalName').value.trim(),
        target: parseFloat(document.getElementById('goalTarget').value),
        current: parseFloat(document.getElementById('goalCurrent').value) || 0,
        deadline: document.getElementById('goalDeadline').value
    };

    if (!data.name || !data.target || !data.deadline) {
        finance.showToast('⚠️ Preencha todos os campos obrigatórios', 'error');
        return;
    }

    if (this.dataset.id) {
        finance.updateGoal(this.dataset.id, data);
    } else {
        finance.addGoal(data);
    }

    document.getElementById('goalModal').classList.remove('active');
});

// Cancel
document.getElementById('cancelGoal').addEventListener('click', () => {
    document.getElementById('goalModal').classList.remove('active');
});