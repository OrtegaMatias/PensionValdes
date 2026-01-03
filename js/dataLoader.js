/**
 * DataLoader - Maneja la carga y validación del archivo JSON
 */
class DataLoader {
  /**
   * Cargar datos desde el archivo JSON
   * @param {string} url - URL del archivo JSON
   * @returns {Promise<object>} Datos del JSON
   */
  static async load(url) {
    try {
      // Agregar timestamp para evitar caché
      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${url}?t=${timestamp}`;

      const response = await fetch(urlWithTimestamp);

      if (!response.ok) {
        throw new Error(`Error al cargar datos: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cargando datos:', error);
      throw new Error(`No se pudieron cargar los datos: ${error.message}`);
    }
  }

  /**
   * Validar estructura y contenido del JSON
   * @param {object} data - Datos a validar
   * @returns {object} { valid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    // Validar estructura meta
    if (!data.meta) {
      errors.push('Falta la sección "meta"');
    } else {
      if (!data.meta.goals) {
        errors.push('Falta "meta.goals"');
      } else {
        if (typeof data.meta.goals.pocillos !== 'number') {
          errors.push('meta.goals.pocillos debe ser un número');
        }
        if (typeof data.meta.goals.charolas !== 'number') {
          errors.push('meta.goals.charolas debe ser un número');
        }
      }

      if (!data.meta.projectName) {
        errors.push('Falta "meta.projectName"');
      }

      if (!data.meta.startDate) {
        errors.push('Falta "meta.startDate"');
      }
    }

    // Validar currentPrint
    if (!data.currentPrint) {
      errors.push('Falta la sección "currentPrint"');
    } else {
      if (typeof data.currentPrint.isActive !== 'boolean') {
        errors.push('currentPrint.isActive debe ser booleano (true/false)');
      }

      if (data.currentPrint.isActive) {
        if (!data.currentPrint.item) {
          errors.push('currentPrint activo requiere "item"');
        }
        if (!data.currentPrint.startTime) {
          errors.push('currentPrint activo requiere "startTime"');
        }
        if (!data.currentPrint.estimatedDuration) {
          errors.push('currentPrint activo requiere "estimatedDuration"');
        }
        if (typeof data.currentPrint.batchSize !== 'number' || data.currentPrint.batchSize <= 0) {
          errors.push('currentPrint activo requiere "batchSize" mayor a 0');
        }
      }
    }

    // Validar history
    if (!Array.isArray(data.history)) {
      errors.push('history debe ser un array');
    } else {
      data.history.forEach((h, i) => {
        if (!h.id) {
          errors.push(`history[${i}]: falta "id"`);
        }
        if (!h.date) {
          errors.push(`history[${i}]: falta "date"`);
        }
        if (!h.item) {
          errors.push(`history[${i}]: falta "item"`);
        }
        if (h.item && !['pocillos', 'charolas'].includes(h.item)) {
          errors.push(`history[${i}]: "item" debe ser "pocillos" o "charolas"`);
        }
        if (typeof h.batchSize !== 'number') {
          errors.push(`history[${i}]: "batchSize" debe ser un número`);
        }
        if (typeof h.duration !== 'number') {
          errors.push(`history[${i}]: "duration" debe ser un número`);
        }
        if (!h.status) {
          errors.push(`history[${i}]: falta "status"`);
        }
        if (h.status && !['completed', 'failed', 'pending', 'partial'].includes(h.status)) {
          errors.push(`history[${i}]: "status" debe ser "completed", "failed", "pending" o "partial"`);
        }
      });
    }

    // Validar issues
    if (!Array.isArray(data.issues)) {
      errors.push('issues debe ser un array');
    } else {
      data.issues.forEach((issue, i) => {
        if (!issue.id) {
          errors.push(`issues[${i}]: falta "id"`);
        }
        if (!issue.date) {
          errors.push(`issues[${i}]: falta "date"`);
        }
        if (!issue.type) {
          errors.push(`issues[${i}]: falta "type"`);
        }
        if (!issue.description) {
          errors.push(`issues[${i}]: falta "description"`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Mostrar errores de validación en la consola
   * @param {string[]} errors - Array de errores
   */
  static logErrors(errors) {
    if (errors.length > 0) {
      console.error('Errores de validación encontrados:');
      errors.forEach((error, i) => {
        console.error(`  ${i + 1}. ${error}`);
      });
    }
  }
}
