/**
 * Calculator - Maneja todos los cálculos de progreso y estimaciones
 */
class Calculator {
  constructor(data) {
    this.data = data;
    // Usar horas configuradas en meta, o default 20h
    this.workHoursPerDay = data.meta.workHoursPerDay || 20;
  }

  /**
   * Actualizar datos
   * @param {object} data - Nuevos datos
   */
  updateData(data) {
    this.data = data;
    this.workHoursPerDay = data.meta.workHoursPerDay || 20;
  }

  /**
   * Calcular progreso actual
   * @returns {object} { pocillos: number, charolas: number }
   */
  getProgress() {
    let pocillos = 0;
    let charolas = 0;

    // Sumar impresiones completadas y parciales (no pending ni failed)
    this.data.history.forEach(h => {
      if (h.status === 'completed' || h.status === 'partial') {
        if (h.item === 'pocillos') {
          pocillos += h.batchSize;
        } else if (h.item === 'charolas') {
          charolas += h.batchSize;
        }
      }
    });

    return { pocillos, charolas };
  }

  /**
   * Calcular porcentaje de progreso
   * @param {string} itemType - 'pocillos' o 'charolas'
   * @returns {number} Porcentaje (0-100)
   */
  getProgressPercentage(itemType) {
    const progress = this.getProgress();
    const goal = this.data.meta.goals[itemType];

    if (!goal || goal === 0) return 0;

    const percentage = (progress[itemType] / goal) * 100;
    return Math.min(100, Math.round(percentage));
  }

  /**
   * Calcular promedio de duración por tipo de ítem
   * @param {string} itemType - 'pocillos' o 'charolas'
   * @returns {number|null} Promedio en minutos, o null si no hay datos
   */
  getAverageDuration(itemType) {
    const completed = this.data.history.filter(
      h => h.item === itemType && (h.status === 'completed' || h.status === 'partial') && h.duration > 0
    );

    if (completed.length === 0) return null;

    const total = completed.reduce((sum, h) => sum + h.duration, 0);
    return Math.round(total / completed.length);
  }

  /**
   * Calcular promedio ponderado (más peso a impresiones recientes)
   * @param {string} itemType - 'pocillos' o 'charolas'
   * @returns {number|null} Promedio ponderado en minutos
   */
  getWeightedAverage(itemType) {
    const completed = this.data.history
      .filter(h => h.item === itemType && (h.status === 'completed' || h.status === 'partial') && h.duration > 0)
      .reverse(); // Más recientes primero

    if (completed.length === 0) return null;

    let weightedSum = 0;
    let weightSum = 0;

    completed.forEach((h, index) => {
      const weight = 1 / (index + 1); // Peso decreciente
      weightedSum += h.duration * weight;
      weightSum += weight;
    });

    return weightSum > 0 ? Math.round(weightedSum / weightSum) : null;
  }

  /**
   * Calcular tiempo restante total
   * @returns {object} { minutes: number, pocillosMinutes: number, charolasMinutes: number }
   */
  getRemainingTime() {
    const progress = this.getProgress();

    // Usar promedio ponderado, o fallback a valores estimados
    const avgPocillo = this.getWeightedAverage('pocillos') || 180; // 3 horas default
    const avgCharola = this.getWeightedAverage('charolas') || 420; // 7 horas default

    const pocillosRestantes = Math.max(0, this.data.meta.goals.pocillos - progress.pocillos);
    const charolasRestantes = Math.max(0, this.data.meta.goals.charolas - progress.charolas);

    const pocillosMinutes = pocillosRestantes * avgPocillo;
    const charolasMinutes = charolasRestantes * avgCharola;

    return {
      minutes: pocillosMinutes + charolasMinutes,
      pocillosMinutes: pocillosMinutes,
      charolasMinutes: charolasMinutes,
      avgPocillo: avgPocillo,
      avgCharola: avgCharola
    };
  }

  /**
   * Calcular fecha estimada de término
   * @returns {object} { date: Date, daysNeeded: number, hoursNeeded: number, confidence: string }
   */
  getEstimatedCompletion() {
    const remaining = this.getRemainingTime();

    if (remaining.minutes === 0) {
      return {
        date: new Date(),
        daysNeeded: 0,
        hoursNeeded: 0,
        confidence: 'high'
      };
    }

    const workMinutesPerDay = this.workHoursPerDay * 60;
    const daysNeeded = Math.ceil(remaining.minutes / workMinutesPerDay);
    const hoursNeeded = Math.ceil(remaining.minutes / 60);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysNeeded);

    return {
      date: completionDate,
      daysNeeded: daysNeeded,
      hoursNeeded: hoursNeeded,
      confidence: this.getConfidenceLevel()
    };
  }

  /**
   * Calcular nivel de confianza de las estimaciones
   * @returns {string} 'high', 'medium', o 'low'
   */
  getConfidenceLevel() {
    const totalCompleted = this.data.history.filter(
      h => h.status === 'completed'
    ).length;

    if (totalCompleted >= 10) return 'high';
    if (totalCompleted >= 3) return 'medium';
    return 'low';
  }

  /**
   * Calcular tiempo transcurrido de la impresión actual
   * @returns {number} Minutos transcurridos
   */
  getCurrentPrintElapsed() {
    if (!this.data.currentPrint.isActive) return 0;

    const start = new Date(this.data.currentPrint.startTime);
    const now = new Date();
    const elapsed = Math.floor((now - start) / 60000); // Convertir a minutos

    return Math.max(0, elapsed);
  }

  /**
   * Calcular porcentaje de progreso de la impresión actual
   * @returns {number} Porcentaje (0-100)
   */
  getCurrentPrintProgress() {
    if (!this.data.currentPrint.isActive) return 0;

    const elapsed = this.getCurrentPrintElapsed();
    const estimated = this.data.currentPrint.estimatedDuration;

    if (!estimated || estimated === 0) return 0;

    const percentage = (elapsed / estimated) * 100;
    return Math.min(100, Math.round(percentage));
  }

  /**
   * Calcular tiempo restante de la impresión actual
   * @returns {number} Minutos restantes
   */
  getCurrentPrintRemaining() {
    if (!this.data.currentPrint.isActive) return 0;

    const elapsed = this.getCurrentPrintElapsed();
    const estimated = this.data.currentPrint.estimatedDuration;

    const remaining = estimated - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Comparar progreso real vs. progreso esperado según fecha pactada
   * @returns {object} Información de comparación temporal
   */
  getScheduleComparison() {
    if (!this.data.meta.startDate || !this.data.meta.targetEndDate) {
      return null;
    }

    const startDate = new Date(this.data.meta.startDate);
    const targetDate = new Date(this.data.meta.targetEndDate);
    const today = new Date();

    // Días totales del proyecto
    const totalDays = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));

    // Días transcurridos
    const daysElapsed = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));

    // Días restantes hasta la fecha pactada
    const daysRemaining = Math.max(0, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));

    // Porcentaje temporal esperado
    const expectedTimeProgress = totalDays > 0 ? Math.min(100, (daysElapsed / totalDays) * 100) : 0;

    // Progreso real (piezas)
    const progress = this.getProgress();
    const totalGoal = this.data.meta.goals.pocillos + this.data.meta.goals.charolas;
    const totalCompleted = progress.pocillos + progress.charolas;
    const actualProgress = totalGoal > 0 ? (totalCompleted / totalGoal) * 100 : 0;

    // Diferencia: positivo = adelantados, negativo = atrasados
    const progressDifference = actualProgress - expectedTimeProgress;

    // Estado del proyecto
    let status = 'on-track';
    if (progressDifference > 10) {
      status = 'ahead';
    } else if (progressDifference < -10) {
      status = 'behind';
    }

    // Calcular si llegarán a tiempo
    const estimation = this.getEstimatedCompletion();
    const willFinishOnTime = estimation.date <= targetDate;

    // Días de adelanto/atraso estimado
    const daysDifference = Math.ceil((estimation.date - targetDate) / (1000 * 60 * 60 * 24));

    return {
      startDate: startDate,
      targetDate: targetDate,
      totalDays: totalDays,
      daysElapsed: daysElapsed,
      daysRemaining: daysRemaining,
      expectedTimeProgress: Math.round(expectedTimeProgress),
      actualProgress: Math.round(actualProgress),
      progressDifference: Math.round(progressDifference),
      status: status,
      willFinishOnTime: willFinishOnTime,
      daysDifference: daysDifference,
      estimatedDate: estimation.date
    };
  }

  /**
   * Calcular estadísticas generales
   * @returns {object} Estadísticas del proyecto
   */
  getStats() {
    const totalPrints = this.data.history.length;
    const completed = this.data.history.filter(h => h.status === 'completed');
    const failed = this.data.history.filter(h => h.status === 'failed');

    const successRate = totalPrints > 0
      ? Math.round((completed.length / totalPrints) * 100)
      : 0;

    const totalTime = completed.reduce((sum, h) => sum + h.duration, 0);

    return {
      totalPrints: totalPrints,
      completed: completed.length,
      failed: failed.length,
      successRate: successRate,
      totalTimeMinutes: totalTime,
      totalTimeHours: Math.round(totalTime / 60),
      averageDurationPocillos: this.getAverageDuration('pocillos'),
      averageDurationCharolas: this.getAverageDuration('charolas')
    };
  }

  /**
   * Formatear minutos a string legible
   * @param {number} minutes - Minutos
   * @returns {string} Formato "Xh Ymin" o "X días"
   */
  static formatDuration(minutes) {
    if (minutes === 0) return '0 min';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (remainingHours > 0) {
        return `${days}d ${remainingHours}h`;
      }
      return `${days} días`;
    }

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    }

    if (hours > 0) {
      return `${hours}h`;
    }

    return `${mins}min`;
  }

  /**
   * Formatear fecha a string legible
   * @param {Date} date - Fecha
   * @returns {string} Formato "DD de MMMM, YYYY"
   */
  static formatDate(date) {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month}, ${year}`;
  }
}
