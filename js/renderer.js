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

    // Información de la impresora (siempre se muestra)
    const printerInfoHtml = `
      <div class="printer-info-card">
        <div class="printer-image-wrapper">
          <img src="https://www.creality.com/cdn/shop/files/Creality_Hi__3.jpg?v=1731293603&width=1000" alt="Creality Hi 3D Printer" loading="lazy">
        </div>
        <h4 class="printer-name">Creality Hi</h4>
        <div class="printer-specs">
          <div class="printer-spec-item">
            <div class="printer-spec-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
              </svg>
            </div>
            <span class="printer-spec-label">Volumen</span>
            <span class="printer-spec-value">260×260×300mm</span>
          </div>
          <div class="printer-spec-item">
            <div class="printer-spec-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
              </svg>
            </div>
            <span class="printer-spec-label">Velocidad</span>
            <span class="printer-spec-value">hasta 500mm/s</span>
          </div>
          <div class="printer-spec-item">
            <div class="printer-spec-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
              </svg>
            </div>
            <span class="printer-spec-label">Temp. Max</span>
            <span class="printer-spec-value">300°C</span>
          </div>
          <div class="printer-spec-item">
            <div class="printer-spec-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <span class="printer-spec-label">Materiales</span>
            <span class="printer-spec-value">PLA, ABS, PETG...</span>
          </div>
        </div>
      </div>
    `;

    if (!this.data.currentPrint.isActive) {
      container.innerHTML = `
        <div class="current-status-content">
          <div class="status-left">
            <div class="status-badge status-idle">EN REPOSO</div>
            <p class="idle-message">No hay impresión en curso actualmente</p>
          </div>
          ${printerInfoHtml}
        </div>
      `;
      return;
    }

    const elapsed = this.calculator.getCurrentPrintElapsed();
    const estimated = this.data.currentPrint.estimatedDuration;
    const remaining = this.calculator.getCurrentPrintRemaining();
    const progress = this.calculator.getCurrentPrintProgress();

    const itemLabel = this.data.currentPrint.item === 'pocillos' ? 'Pocillos' : 'Charolas';
    const startTime = new Date(this.data.currentPrint.startTime);
    const startTimeStr = startTime.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    container.innerHTML = `
      <div class="current-status-content">
        <div class="status-left">
          <div class="status-badge status-active">FUNCIONANDO</div>
          <div class="status-info">
            <h3>Imprimiendo ${this.data.currentPrint.batchSize} ${itemLabel}</h3>
            <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">Iniciado: ${startTimeStr}</p>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="estimation-primary" style="margin-top: var(--spacing-lg); padding: 0; border: none;">
              <div class="estimation-item">
                <div class="estimation-label">Tipo</div>
                <div class="estimation-value" style="font-size: 1.25rem;">${itemLabel}</div>
              </div>
              <div class="estimation-item">
                <div class="estimation-label">Lote</div>
                <div class="estimation-value" style="font-size: 1.25rem;">${this.data.currentPrint.batchSize} unidades</div>
              </div>
              <div class="estimation-item">
                <div class="estimation-label">Duración Estimada</div>
                <div class="estimation-value" style="font-size: 1.25rem;">${Calculator.formatDuration(estimated)}</div>
              </div>
              <div class="estimation-item">
                <div class="estimation-label">Tiempo Transcurrido</div>
                <div class="estimation-value" style="font-size: 1.25rem;">${Calculator.formatDuration(elapsed)}</div>
              </div>
            </div>
            <p class="text-muted" style="margin-top: var(--spacing-md); text-align: center;">
              <strong>Tiempo restante:</strong> ${Calculator.formatDuration(remaining)}
            </p>
          </div>
        </div>
        ${printerInfoHtml}
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

    const color = colorClass === 'primary' ? '#A5B4FC' : '#FDBA74';

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
        <div class="estimation-schedule">
          <div class="schedule-header">
            <h4>Comparación con Cronograma</h4>
          </div>
          <div class="schedule-metrics">
            <div class="schedule-metric">
              <div class="schedule-icon-wrapper ${schedule.willFinishOnTime ? 'success' : 'warning'}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  ${schedule.willFinishOnTime
                    ? '<polyline points="20 6 9 17 4 12"/>'
                    : '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'}
                </svg>
              </div>
              <div class="schedule-details">
                <div class="schedule-label">Estado</div>
                <div class="schedule-value ${statusClass}">${statusLabel}</div>
              </div>
            </div>
            <div class="schedule-metric">
              <div class="schedule-icon-wrapper neutral">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div class="schedule-details">
                <div class="schedule-label">Fecha Pactada</div>
                <div class="schedule-value">${Calculator.formatDate(schedule.targetDate)}</div>
              </div>
            </div>
            <div class="schedule-metric">
              <div class="schedule-icon-wrapper ${schedule.progressDifference >= 0 ? 'success' : 'error'}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="20" x2="12" y2="10"/>
                  <line x1="18" y1="20" x2="18" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="16"/>
                </svg>
              </div>
              <div class="schedule-details">
                <div class="schedule-label">Diferencia de Progreso</div>
                <div class="schedule-value ${statusClass}">${schedule.progressDifference > 0 ? '+' : ''}${schedule.progressDifference}%</div>
              </div>
            </div>
            <div class="schedule-metric">
              <div class="schedule-icon-wrapper ${schedule.willFinishOnTime ? 'success' : 'warning'}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="schedule-details">
                <div class="schedule-label">Desviación Temporal</div>
                <div class="schedule-value ${schedule.willFinishOnTime ? 'text-success' : 'text-error'}">${diffText}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="estimation-content">
        <div class="estimation-primary">
          <div class="estimation-card">
            <div class="estimation-icon-wrapper clock">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="estimation-details">
              <div class="estimation-label">Tiempo Restante</div>
              <div class="estimation-value">${Calculator.formatDuration(remaining.minutes)}</div>
            </div>
          </div>
          <div class="estimation-card">
            <div class="estimation-icon-wrapper calendar">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="estimation-details">
              <div class="estimation-label">Días Necesarios</div>
              <div class="estimation-value">${estimation.daysNeeded} días</div>
            </div>
          </div>
          <div class="estimation-card highlight">
            <div class="estimation-icon-wrapper target">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div class="estimation-details">
              <div class="estimation-label">Fecha Estimada de Término</div>
              <div class="estimation-value">${Calculator.formatDate(estimation.date)}</div>
            </div>
          </div>
        </div>
        ${scheduleHtml}
      </div>
      <div class="estimation-disclaimer">
        <strong>Datos de estimación:</strong> ${stats.completed} impresiones completadas • ${this.calculator.workHoursPerDay}h de trabajo diarias
        ${schedule ? ` • Progreso esperado: ${schedule.expectedTimeProgress}% vs. real: ${schedule.actualProgress}%` : ''}
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
      // Detectar si es la impresión actual activa
      const isCurrentPrint = this.data.currentPrint.isActive &&
                             h.item === this.data.currentPrint.item &&
                             h.batchSize === this.data.currentPrint.batchSize &&
                             h.date === this.data.currentPrint.startTime.split('T')[0];

      // Calcular si el tiempo estimado ya pasó (solo para la impresión actual)
      let isPendingReview = false;
      if (isCurrentPrint && h.status === 'pending') {
        const startTime = new Date(this.data.currentPrint.startTime);
        const now = new Date();
        const elapsedMinutes = Math.floor((now - startTime) / 60000);
        isPendingReview = elapsedMinutes >= this.data.currentPrint.estimatedDuration;
      }

      // Determinar el badge de estado
      let statusClass, statusLabel;

      if (isPendingReview) {
        statusClass = 'badge-pending-review';
        statusLabel = '⏰ Pendiente de revisión';
      } else if (isCurrentPrint) {
        statusClass = 'badge-printing';
        statusLabel = '🖨️ Imprimiendo';
      } else if (h.status === 'pending') {
        statusClass = 'badge-pending';
        statusLabel = '⏳ Pendiente';
      } else if (h.status === 'completed') {
        statusClass = 'badge-completed';
        statusLabel = '✓ Exitosa';
      } else if (h.status === 'partial') {
        statusClass = 'badge-partial';
        statusLabel = '⚠️ Parcial';
      } else {
        statusClass = 'badge-failed';
        statusLabel = '✗ Fallida';
      }

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
