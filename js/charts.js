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
    this.renderProjection();
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

  /**
   * Gráfica 4: Proyección de Progreso (Line Chart)
   */
  renderProjection() {
    const canvas = document.getElementById('chart-projection');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Calcular progreso histórico
    const historicalDates = [];
    const historicalProgress = [];

    let totalAcc = 0;

    const completed = this.data.history
      .filter(h => h.status === 'completed')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    completed.forEach(h => {
      totalAcc += h.batchSize;
      historicalDates.push(h.date);
      historicalProgress.push(totalAcc);
    });

    // Calcular proyección
    const totalGoal = this.data.meta.goals.pocillos + this.data.meta.goals.charolas;
    const currentProgress = totalAcc;
    const remainingItems = totalGoal - currentProgress;

    if (remainingItems <= 0 || historicalDates.length === 0) {
      // Si ya está completo o no hay datos históricos
      if (this.chartInstances.projection) {
        this.chartInstances.projection.destroy();
      }

      this.chartInstances.projection = new Chart(ctx, {
        type: 'line',
        data: {
          labels: historicalDates,
          datasets: [{
            label: 'Progreso Real',
            data: historicalProgress,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: false,
            tension: 0.1,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Total de Piezas'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Fecha'
              }
            }
          }
        }
      });
      return;
    }

    // Calcular tasa de progreso (items por día)
    const firstDate = new Date(historicalDates[0]);
    const lastDate = new Date(historicalDates[historicalDates.length - 1]);
    const daysElapsed = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));
    const itemsPerDay = currentProgress / daysElapsed;

    // Estimar días para completar
    const daysToComplete = Math.ceil(remainingItems / itemsPerDay);

    // Crear puntos de proyección
    const projectionDates = [...historicalDates];
    const projectionProgress = [...historicalProgress];

    // Agregar puntos futuros
    const steps = Math.min(10, daysToComplete);
    const stepSize = Math.ceil(daysToComplete / steps);

    for (let i = 1; i <= steps; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + (i * stepSize));

      const projectedProgress = Math.min(
        totalGoal,
        currentProgress + (itemsPerDay * i * stepSize)
      );

      projectionDates.push(futureDate.toISOString().split('T')[0]);
      projectionProgress.push(Math.round(projectedProgress));
    }

    // Destruir instancia previa
    if (this.chartInstances.projection) {
      this.chartInstances.projection.destroy();
    }

    // Preparar datasets
    const historicalData = historicalProgress.concat(
      Array(projectionDates.length - historicalDates.length).fill(null)
    );

    const projectionData = Array(historicalDates.length - 1).fill(null).concat(
      projectionProgress.slice(historicalDates.length - 1)
    );

    // Crear gráfica
    this.chartInstances.projection = new Chart(ctx, {
      type: 'line',
      data: {
        labels: projectionDates,
        datasets: [
          {
            label: 'Progreso Real',
            data: historicalData,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: false,
            tension: 0.1,
            borderWidth: 2
          },
          {
            label: 'Proyección',
            data: projectionData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderDash: [5, 5],
            fill: false,
            tension: 0.1,
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
            max: totalGoal + 5,
            title: {
              display: true,
              text: 'Total de Piezas'
            },
            ticks: {
              stepSize: 10
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
}
