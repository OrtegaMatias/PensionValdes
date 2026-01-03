/**
 * Renderer - Maneja el renderizado de todos los componentes del dashboard
 */
class Renderer {
  constructor(data, calculator) {
    this.data = data;
    this.calculator = calculator;
    this.showAllHistory = false;
  }

  /**
   * Actualizar datos y calculator
   */
  update(data, calculator) {
    this.data = data;
    this.calculator = calculator;
  }

  /**
   * Renderizar estado actual de la impresora
   */
  renderCurrentStatus() {
    const container = document.getElementById('current-status-container');
    if (!container) return;

    if (!this.data.currentPrint.isActive) {
      container.innerHTML = `
        <div class="current-status-content">
          <div class="status-badge status-idle">EN REPOSO</div>
          <p class="idle-message">No hay impresión en curso actualmente</p>
        </div>
      `;
      return;
    }

    const elapsed = this.calculator.getCurrentPrintElapsed();
    const estimated = this.data.currentPrint.estimatedDuration;
    const remaining = this.calculator.getCurrentPrintRemaining();
    const progress = this.calculator.getCurrentPrintProgress();

    const itemLabel = this.data.currentPrint.item === 'pocillos' ? 'Pocillos' : 'Charolas';

    container.innerHTML = `
      <div class="current-status-content">
        <div class="status-badge status-active">FUNCIONANDO</div>
        <div class="status-info">
          <h3>Imprimiendo: ${itemLabel}</h3>
          <p>Lote: ${this.data.currentPrint.batchSize} unidades</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="time-info">
            <span class="time-elapsed">${Calculator.formatDuration(elapsed)}</span>
            <span>/</span>
            <span class="time-estimated">${Calculator.formatDuration(estimated)} estimados</span>
          </div>
          <p class="text-muted">Tiempo restante: ${Calculator.formatDuration(remaining)}</p>
        </div>
      </div>
    `;
  }

  /**
   * Renderizar progreso general
   */
  renderProgress() {
    const progress = this.calculator.getProgress();

    // Pocillos
    this.renderProgressCard(
      'progress-pocillos',
      'Pocillos',
      progress.pocillos,
      this.data.meta.goals.pocillos,
      'primary'
    );

    // Charolas
    this.renderProgressCard(
      'progress-charolas',
      'Charolas',
      progress.charolas,
      this.data.meta.goals.charolas,
      'secondary'
    );
  }

  /**
   * Renderizar una tarjeta de progreso individual
   */
  renderProgressCard(containerId, label, current, goal, colorClass) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const percentage = goal > 0 ? Math.round((current / goal) * 100) : 0;
    const circumference = 2 * Math.PI * 70; // radio = 70
    const offset = circumference - (percentage / 100) * circumference;

    const color = colorClass === 'primary' ? '#2563eb' : '#f59e0b';

    container.innerHTML = `
      <h3 class="progress-label">${label}</h3>
      <div class="circular-progress-container">
        <svg class="circular-progress" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" stroke-width="12"/>
          <circle cx="80" cy="80" r="70" fill="none" stroke="${color}" stroke-width="12"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                  style="transition: stroke-dashoffset 0.5s ease;"/>
        </svg>
        <div class="progress-text">
          <div class="progress-number">${percentage}%</div>
        </div>
      </div>
      <div class="progress-count">${current}<span class="progress-goal"> / ${goal}</span></div>
    `;
  }

  /**
   * Renderizar estimación de término
   */
  renderEstimation() {
    const container = document.getElementById('estimation-container');
    if (!container) return;

    const remaining = this.calculator.getRemainingTime();
    const estimation = this.calculator.getEstimatedCompletion();
    const stats = this.calculator.getStats();
    const schedule = this.calculator.getScheduleComparison();

    if (remaining.minutes === 0) {
      container.innerHTML = `
        <div class="estimation-content">
          <div class="estimation-item">
            <div class="estimation-value text-success">¡Completado!</div>
            <div class="estimation-label">Proyecto Finalizado</div>
          </div>
        </div>
      `;
      return;
    }

    const confidenceClass = `confidence-${estimation.confidence}`;
    const confidenceLabel = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    }[estimation.confidence];

    let scheduleHtml = '';
    if (schedule) {
      const statusLabel = {
        'ahead': '🚀 Adelantado',
        'on-track': '✓ En tiempo',
        'behind': '⚠️ Atrasado'
      }[schedule.status];

      const statusClass = {
        'ahead': 'text-success',
        'on-track': 'text-success',
        'behind': 'text-error'
      }[schedule.status];

      const diffText = schedule.willFinishOnTime
        ? `${Math.abs(schedule.daysDifference)} días antes`
        : `${Math.abs(schedule.daysDifference)} días después`;

      scheduleHtml = `
        <div class="estimation-item">
          <div class="estimation-value ${statusClass}">${statusLabel}</div>
          <div class="estimation-label">Estado vs. Plazo</div>
        </div>
        <div class="estimation-item">
          <div class="estimation-value">${Calculator.formatDate(schedule.targetDate)}</div>
          <div class="estimation-label">Fecha Pactada</div>
        </div>
        <div class="estimation-item">
          <div class="estimation-value ${statusClass}">${schedule.progressDifference > 0 ? '+' : ''}${schedule.progressDifference}%</div>
          <div class="estimation-label">Diferencia de Progreso</div>
        </div>
        <div class="estimation-item">
          <div class="estimation-value ${schedule.willFinishOnTime ? 'text-success' : 'text-error'}">${diffText}</div>
          <div class="estimation-label">Vs. Plazo Pactado</div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="estimation-content">
        <div class="estimation-item">
          <div class="estimation-value">${Calculator.formatDuration(remaining.minutes)}</div>
          <div class="estimation-label">Tiempo Restante</div>
        </div>
        <div class="estimation-item">
          <div class="estimation-value">${estimation.daysNeeded}</div>
          <div class="estimation-label">Días Estimados</div>
        </div>
        <div class="estimation-item">
          <div class="estimation-value">${Calculator.formatDate(estimation.date)}</div>
          <div class="estimation-label">Fecha Estimada</div>
        </div>
        <div class="estimation-item">
          <div class="confidence-badge ${confidenceClass}">${confidenceLabel}</div>
          <div class="estimation-label">Confianza</div>
        </div>
        ${scheduleHtml}
      </div>
      <div class="estimation-disclaimer">
        Estimación basada en ${stats.completed} impresiones completadas.
        Considera ${this.calculator.workHoursPerDay}h de trabajo diarias.
        ${schedule ? `<br>Progreso esperado: ${schedule.expectedTimeProgress}% vs. Progreso real: ${schedule.actualProgress}%` : ''}
      </div>
    `;
  }

  /**
   * Renderizar historial de impresiones
   */
  renderHistory() {
    const container = document.getElementById('history-container');
    if (!container) return;

    if (this.data.history.length === 0) {
      container.innerHTML = '<div class="no-data-message">No hay impresiones registradas aún</div>';
      return;
    }

    // Ordenar por fecha (más reciente primero)
    const sorted = [...this.data.history].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    // Limitar a 10 si no se muestra todo
    const toShow = this.showAllHistory ? sorted : sorted.slice(0, 10);

    const rows = toShow.map(h => {
      const statusClass = h.status === 'completed' ? 'badge-completed' : 'badge-failed';
      const statusLabel = h.status === 'completed' ? 'Completada' : 'Fallida';
      const itemClass = h.item === 'pocillos' ? 'item-pocillos' : 'item-charolas';
      const itemLabel = h.item === 'pocillos' ? 'Pocillos' : 'Charolas';
      const durationText = h.duration > 0 ? Calculator.formatDuration(h.duration) : '--';

      return `
        <tr>
          <td>${h.date}</td>
          <td class="${itemClass}">${itemLabel}</td>
          <td>${h.batchSize}</td>
          <td>${durationText}</td>
          <td><span class="${statusClass}">${statusLabel}</span></td>
          <td>${h.notes || '--'}</td>
        </tr>
      `;
    }).join('');

    let showMoreButton = '';
    if (!this.showAllHistory && sorted.length > 10) {
      showMoreButton = `
        <div style="text-align: center; margin-top: var(--spacing-lg);">
          <button id="btn-show-all-history" class="btn-secondary">
            Ver todas (${sorted.length})
          </button>
        </div>
      `;
    }

    container.innerHTML = `
      <table class="history-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Ítem</th>
            <th>Lote</th>
            <th>Duración</th>
            <th>Estado</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      ${showMoreButton}
    `;
  }

  /**
   * Toggle para mostrar todo el historial
   */
  toggleFullHistory() {
    this.showAllHistory = !this.showAllHistory;
    this.renderHistory();
  }

  /**
   * Renderizar problemas/issues
   */
  renderIssues() {
    const container = document.getElementById('issues-container');
    if (!container) return;

    if (this.data.issues.length === 0) {
      container.innerHTML = '<div class="no-data-message">No hay problemas registrados</div>';
      return;
    }

    // Ordenar por fecha (más reciente primero)
    const sorted = [...this.data.issues].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    const items = sorted.map(issue => {
      return `
        <div class="issue-item">
          <div class="issue-header">
            <span class="issue-date">${issue.date}</span>
            <span class="issue-type">${issue.type}</span>
          </div>
          <div class="issue-description">${issue.description}</div>
          ${issue.resolution ? `
            <div class="issue-resolution">
              <strong>Resolución:</strong> ${issue.resolution}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="issues-list">${items}</div>`;
  }

  /**
   * Mostrar mensaje de error
   */
  showError(message) {
    const container = document.querySelector('.container');
    if (!container) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.innerHTML = `
      <strong>Error:</strong> ${message}
    `;

    container.insertBefore(errorDiv, container.firstChild);
  }

  /**
   * Mostrar mensaje de éxito
   */
  showSuccess(message) {
    const container = document.querySelector('.container');
    if (!container) return;

    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;

    container.insertBefore(successDiv, container.firstChild);

    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  /**
   * Actualizar timestamp de última actualización
   */
  updateLastRefreshTime() {
    const element = document.getElementById('last-update');
    if (!element) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES');
    element.textContent = timeString;
  }

  /**
   * Actualizar fecha de inicio del proyecto
   */
  updateProjectStartDate() {
    const element = document.getElementById('project-start-date');
    if (!element) return;

    element.textContent = this.data.meta.startDate;
  }

  /**
   * Renderizar todo el dashboard
   */
  renderAll() {
    this.renderCurrentStatus();
    this.renderProgress();
    this.renderEstimation();
    this.renderHistory();
    this.renderIssues();
    this.updateLastRefreshTime();
    this.updateProjectStartDate();
  }
}
