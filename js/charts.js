/**
 * Charts - Maneja la creación y renderizado de todas las gráficas
 */
class Charts {
  constructor(data) {
    this.data = data;
    this.chartInstances = {};
  }

  /**
   * Actualizar datos
   */
  updateData(data) {
    this.data = data;
  }

  /**
   * Renderizar todas las gráficas
   */
  renderAll() {
    this.renderCumulativeProgress();
    this.renderDurationChart();
    this.renderSuccessRate();
  }

  /**
   * Destruir todas las instancias de gráficas
   */
  destroyAll() {
    Object.values(this.chartInstances).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    this.chartInstances = {};
  }

  /**
   * Gráfica 1: Progreso Acumulado (Line Chart)
   */
  renderCumulativeProgress() {
    const canvas = document.getElementById('chart-cumulative');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Preparar datos
    const dates = [];
    const pocillosData = [];
    const charolasData = [];

    let pocillosAcc = 0;
    let charolasAcc = 0;

    const completed = this.data.history
      .filter(h => h.status === 'completed')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    completed.forEach(h => {
      if (h.item === 'pocillos') {
        pocillosAcc += h.batchSize;
      } else if (h.item === 'charolas') {
        charolasAcc += h.batchSize;
      }

      dates.push(h.date);
      pocillosData.push(pocillosAcc);
      charolasData.push(charolasAcc);
    });

    // Destruir instancia previa
    if (this.chartInstances.cumulative) {
      this.chartInstances.cumulative.destroy();
    }

    // Crear gráfica
    this.chartInstances.cumulative = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Pocillos',
            data: pocillosData,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: 'Charolas',
            data: charolasData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad Acumulada'
            },
            ticks: {
              stepSize: 5
            }
          },
          x: {
            title: {
              display: true,
              text: 'Fecha'
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  /**
   * Gráfica 2: Duración por Lote (Bar Chart)
   */
  renderDurationChart() {
    const canvas = document.getElementById('chart-duration');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Preparar datos
    const labels = [];
    const durations = [];
    const colors = [];

    this.data.history
      .filter(h => h.status === 'completed')
      .forEach(h => {
        labels.push(`#${h.id}`);
        durations.push(h.duration);
        colors.push(h.item === 'pocillos' ? '#2563eb' : '#f59e0b');
      });

    // Destruir instancia previa
    if (this.chartInstances.duration) {
      this.chartInstances.duration.destroy();
    }

    // Crear gráfica
    this.chartInstances.duration = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Duración (minutos)',
          data: durations,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const h = this.data.history.filter(h => h.status === 'completed')[index];
                const itemLabel = h.item === 'pocillos' ? 'Pocillos' : 'Charolas';
                return [
                  `Duración: ${context.parsed.y} min`,
                  `Ítem: ${itemLabel}`,
                  `Lote: ${h.batchSize} unidades`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Minutos'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Impresión'
            }
          }
        }
      }
    });
  }

  /**
   * Gráfica 3: Tasa de Éxito (Doughnut Chart)
   */
  renderSuccessRate() {
    const canvas = document.getElementById('chart-success-rate');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Preparar datos
    const completed = this.data.history.filter(h => h.status === 'completed').length;
    const failed = this.data.history.filter(h => h.status === 'failed').length;

    // Destruir instancia previa
    if (this.chartInstances.successRate) {
      this.chartInstances.successRate.destroy();
    }

    // Crear gráfica
    this.chartInstances.successRate = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completadas', 'Fallidas'],
        datasets: [{
          data: [completed, failed],
          backgroundColor: ['#10b981', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = completed + failed;
                const percentage = total > 0
                  ? ((context.parsed / total) * 100).toFixed(1)
                  : 0;
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

}
