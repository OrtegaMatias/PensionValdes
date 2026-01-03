# Dashboard de Impresión 3D - Proyecto Pensión Valdés

Dashboard web para monitorear el progreso de un proyecto de impresión 3D: 100 pocillos y 20 charolas.

## Características

- Estado en tiempo real de la impresora (funcionando/en reposo)
- Contadores de progreso con visualización circular
- Estimación automática de tiempo de término
- 4 gráficas analíticas:
  - Progreso acumulado
  - Duración por lote
  - Tasa de éxito
  - Proyección de progreso
- Historial completo de impresiones
- Registro de problemas y resoluciones
- Auto-actualización cada 60 segundos
- Diseño responsive (móvil y escritorio)

## Ver el Dashboard

Una vez desplegado en GitHub Pages, el dashboard estará disponible en:

```
https://[tu-usuario].github.io/PensionValdes/
```

## Actualizar el Dashboard

El dashboard se actualiza editando el archivo `data/print-data.json` y subiéndolo a GitHub. A continuación se explican los casos de uso más comunes:

### 1. Iniciar una nueva impresión

Edita `data/print-data.json` y modifica la sección `currentPrint`:

```json
{
  "currentPrint": {
    "isActive": true,
    "item": "pocillos",
    "batchSize": 4,
    "startTime": "2026-01-03T14:30:00",
    "estimatedDuration": 180
  }
}
```

**Campos:**
- `isActive`: `true` para indicar que hay una impresión en curso
- `item`: `"pocillos"` o `"charolas"`
- `batchSize`: número de piezas en el lote (ej: 4)
- `startTime`: fecha y hora de inicio en formato ISO `"YYYY-MM-DDTHH:MM:SS"`
- `estimatedDuration`: tiempo estimado en minutos (ej: 180 = 3 horas)

### 2. Completar una impresión

Cuando una impresión termine exitosamente:

**Paso 1:** Agregar al historial

Encuentra la sección `history` y agrega una nueva entrada:

```json
{
  "history": [
    {
      "id": 3,
      "date": "2026-01-03",
      "item": "pocillos",
      "batchSize": 4,
      "duration": 185,
      "status": "completed",
      "notes": ""
    }
  ]
}
```

**Campos:**
- `id`: siguiente número consecutivo
- `date`: fecha de la impresión `"YYYY-MM-DD"`
- `item`: `"pocillos"` o `"charolas"`
- `batchSize`: cantidad impresa
- `duration`: duración real en minutos
- `status`: `"completed"` para exitosa
- `notes`: notas opcionales (ej: "Primera impresión exitosa")

**Paso 2:** Desactivar currentPrint

```json
{
  "currentPrint": {
    "isActive": false,
    "item": "",
    "batchSize": 0,
    "startTime": "",
    "estimatedDuration": 0
  }
}
```

### 3. Registrar una impresión fallida

Cuando una impresión falle:

**Paso 1:** Agregar al historial con `status: "failed"`

```json
{
  "history": [
    {
      "id": 4,
      "date": "2026-01-04",
      "item": "charolas",
      "batchSize": 1,
      "duration": 0,
      "status": "failed",
      "notes": "Filamento se acabó a mitad de impresión"
    }
  ]
}
```

**Paso 2:** Agregar a la sección `issues`

```json
{
  "issues": [
    {
      "id": 1,
      "date": "2026-01-04",
      "type": "material",
      "description": "Filamento se acabó a mitad de impresión",
      "resolution": "Reemplazado carrete y reiniciado",
      "printId": 4
    }
  ]
}
```

**Tipos de problemas comunes:**
- `material`: Problemas con filamento
- `hardware`: Problemas mecánicos de la impresora
- `software`: Problemas de configuración o firmware
- `adhesion`: Problemas de adherencia a la cama
- `quality`: Problemas de calidad de impresión

**Paso 3:** Desactivar currentPrint (mismo que paso 2 anterior)

### 4. Subir cambios a GitHub

Después de editar `data/print-data.json`, sube los cambios:

```bash
# Agregar el archivo modificado
git add data/print-data.json

# Crear commit
git commit -m "Actualizar estado de impresión"

# Subir a GitHub
git push
```

El dashboard se actualizará automáticamente en 1-2 minutos.

## Configurar GitHub Pages

### Primera vez

1. Crea un nuevo repositorio en GitHub llamado `PensionValdes`

2. Inicializa Git en tu directorio local:

```bash
cd /Users/namonaque/Documents/PensionValdes
git init
git add .
git commit -m "Initial commit: Dashboard de impresión 3D"
```

3. Conecta con el repositorio remoto:

```bash
git remote add origin https://github.com/[tu-usuario]/PensionValdes.git
git branch -M main
git push -u origin main
```

4. Activa GitHub Pages:
   - Ve a Settings > Pages
   - En "Source", selecciona "main" branch
   - En "Folder", selecciona "/ (root)"
   - Click en "Save"

5. Espera 1-2 minutos y visita:
   ```
   https://[tu-usuario].github.io/PensionValdes/
   ```

## Desarrollo Local

Para probar el dashboard localmente, necesitas un servidor web (no funcionará abriendo el HTML directamente debido a las restricciones de CORS).

### Opción 1: Python (recomendado)

```bash
# Python 3
python3 -m http.server 8000

# Luego visita: http://localhost:8000
```

### Opción 2: Node.js

```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar servidor
http-server

# Luego visita: http://localhost:8080
```

### Opción 3: VSCode

Instala la extensión "Live Server" y haz click derecho en `index.html` > "Open with Live Server"

## Estructura del Proyecto

```
PensionValdes/
├── index.html                    # Página principal
├── css/
│   ├── main.css                 # Estilos base y variables
│   ├── components.css           # Componentes UI
│   └── responsive.css           # Media queries
├── js/
│   ├── app.js                   # Aplicación principal
│   ├── dataLoader.js            # Carga de datos
│   ├── calculator.js            # Cálculos y estimaciones
│   ├── renderer.js              # Renderizado del DOM
│   └── charts.js                # Gráficas
├── data/
│   └── print-data.json          # Datos del proyecto
└── README.md                     # Este archivo
```

## Preguntas Frecuentes

### ¿Con qué frecuencia se actualiza el dashboard?

El dashboard recarga los datos automáticamente cada 60 segundos. También puedes hacer click en el botón de refresh (⟳) en la esquina superior derecha para actualizar manualmente.

### ¿Qué pasa si edito mal el JSON?

Si el JSON tiene errores de sintaxis, el dashboard mostrará un mensaje de error. Revisa:
- Que todas las comillas sean dobles (`"`)
- Que no falten comas entre elementos
- Que los corchetes `[]` y llaves `{}` estén balanceados
- Puedes validar tu JSON en: https://jsonlint.com/

### ¿Cómo cambio las horas de trabajo por día?

Actualmente está configurado para 8 horas por día. Para cambiar esto, edita `js/calculator.js` línea 5:

```javascript
this.workHoursPerDay = 8; // Cambia este valor
```

### ¿Puedo agregar más metas?

Sí, pero requiere modificar el código. Actualmente solo soporta pocillos y charolas. Para agregar más tipos necesitarías modificar varios archivos JavaScript.

### ¿Cómo personalizo los colores?

Los colores se definen en `css/main.css` en las variables CSS:

```css
:root {
  --primary: #2563eb;      /* Azul para pocillos */
  --secondary: #f59e0b;    /* Naranja para charolas */
  --success: #10b981;      /* Verde para éxito */
  --error: #ef4444;        /* Rojo para errores */
}
```

## Tecnologías Utilizadas

- HTML5
- CSS3 (Variables CSS, Flexbox, Grid)
- JavaScript vanilla (ES6+)
- [Chart.js](https://www.chartjs.org/) v4.4.0 para las gráficas

## Licencia

Este proyecto es de uso personal. Siéntete libre de modificarlo según tus necesidades.

## Soporte

Si encuentras algún problema:
1. Revisa la consola del navegador (F12 > Console) para ver errores
2. Verifica que el JSON sea válido
3. Asegúrate de que todos los archivos estén en su lugar

---

Desarrollado para el Proyecto Pensión Valdés
