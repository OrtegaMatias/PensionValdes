/**
 * DashboardApp - Aplicación principal que orquesta todo el dashboard
 */
class DashboardApp {
  constructor() {
    this.data = null;
    this.calculator = null;
    this.renderer = null;
    this.charts = null;
    this.refreshInterval = 60000; // 1 minuto en milisegundos
    this.autoRefreshTimer = null;
  }

  /**
   * Inicializar la aplicación
   */
  async init() {
    try {
      console.log('Inicializando Dashboard de Impresión 3D...');

      // 1. Cargar datos
      this.data = await DataLoader.load('data/print-data.json');
      console.log('Datos cargados:', this.data);

      // 2. Validar datos
      const validation = DataLoader.validate(this.data);
      if (!validation.valid) {
        DataLoader.logErrors(validation.errors);
        throw new Error('Los datos no son válidos. Revisa la consola para más detalles.');
      }
      console.log('Datos validados correctamente');

      // 3. Inicializar módulos
      this.calculator = new Calculator(this.data);
      this.renderer = new Renderer(this.data, this.calculator);
      this.charts = new Charts(this.data);

      // 4. Renderizar dashboard completo
      this.render();
      console.log('Dashboard renderizado');

      // 5. Configurar event listeners
      this.setupEventListeners();

      // 6. Iniciar auto-refresh
      this.startAutoRefresh();
      console.log('Auto-refresh activado');

      console.log('Dashboard inicializado correctamente');

    } catch (error) {
      console.error('Error inicializando dashboard:', error);
      this.showErrorMessage(error.message);
    }
  }

  /**
   * Renderizar todo el dashboard
   */
  render() {
    try {
      // Renderizar componentes
      this.renderer.renderAll();

      // Renderizar gráficas
      this.charts.renderAll();

    } catch (error) {
      console.error('Error renderizando:', error);
      this.showErrorMessage('Error al renderizar el dashboard');
    }
  }

  /**
   * Refrescar datos y re-renderizar
   */
  async refresh() {
    try {
      console.log('Refrescando datos...');

      // Cargar nuevos datos
      const newData = await DataLoader.load('data/print-data.json');

      // Validar
      const validation = DataLoader.validate(newData);
      if (!validation.valid) {
        DataLoader.logErrors(validation.errors);
        console.error('Los nuevos datos no son válidos');
        return;
      }

      // Actualizar datos en todos los módulos
      this.data = newData;
      this.calculator.updateData(newData);
      this.renderer.update(newData, this.calculator);
      this.charts.updateData(newData);

      // Re-renderizar
      this.charts.destroyAll(); // Destruir gráficas previas
      this.render();

      console.log('Dashboard actualizado');

    } catch (error) {
      console.error('Error refrescando:', error);
      // No mostrar error al usuario en refresh automático
    }
  }

  /**
   * Iniciar auto-refresh
   */
  startAutoRefresh() {
    // Limpiar timer previo si existe
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }

    // Configurar nuevo timer
    this.autoRefreshTimer = setInterval(() => {
      this.refresh();
    }, this.refreshInterval);
  }

  /**
   * Detener auto-refresh
   */
  stopAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Botón de refresh manual
    const btnRefresh = document.getElementById('btn-refresh');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', async () => {
        console.log('Refresh manual solicitado');
        await this.refresh();
        this.showSuccessMessage('Dashboard actualizado');
      });
    }

    // Delegación de eventos para botón "Ver todo" del historial
    // (el botón se re-crea cada vez que se renderiza)
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'btn-show-all-history') {
        this.renderer.toggleFullHistory();
      }
    });

    // Detectar cuando la pestaña está visible/oculta
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pausar auto-refresh cuando no es visible
        this.stopAutoRefresh();
      } else {
        // Reanudar auto-refresh y hacer un refresh inmediato
        this.startAutoRefresh();
        this.refresh();
      }
    });

    // Refresh al cambiar el foco de la ventana
    window.addEventListener('focus', () => {
      this.refresh();
    });
  }

  /**
   * Mostrar mensaje de error
   */
  showErrorMessage(message) {
    const container = document.querySelector('.container');
    if (!container) {
      alert(`Error: ${message}`);
      return;
    }

    // Remover alertas previas
    const prevAlerts = container.querySelectorAll('.alert');
    prevAlerts.forEach(alert => alert.remove());

    // Crear nueva alerta
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.innerHTML = `<strong>Error:</strong> ${message}`;

    container.insertBefore(alert, container.firstChild);
  }

  /**
   * Mostrar mensaje de éxito
   */
  showSuccessMessage(message) {
    const container = document.querySelector('.container');
    if (!container) return;

    // Remover alertas previas
    const prevAlerts = container.querySelectorAll('.alert-success');
    prevAlerts.forEach(alert => alert.remove());

    // Crear nueva alerta
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.textContent = message;

    container.insertBefore(alert, container.firstChild);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
      alert.remove();
    }, 3000);
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new DashboardApp();
  app.init();
});
