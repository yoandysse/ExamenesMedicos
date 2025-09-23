# Plataforma de Exámenes COT - Versión Moderna

Una plataforma completa para exámenes de Cirugía Ortopédica y Traumatología construida con tecnologías modernas.

## 🚀 Tecnologías Utilizadas

- **Vite** - Build tool y dev server ultra rápido
- **React 18** - Framework de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **shadcn/ui** - Componentes de UI modernos y accesibles
- **SQLite** - Base de datos local liviana
- **React Router** - Navegación del lado del cliente

## 📦 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Migrar preguntas existentes (opcional)
Si tienes preguntas en el archivo `questions-data.js`, puedes migrarlas:
```bash
node migrate-questions.js
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/              # Componentes base de shadcn/ui
│   ├── exam/            # Componentes del examen
│   └── admin/           # Panel de administración
├── database/            # Configuración de SQLite
├── types/               # Definiciones TypeScript
├── lib/                 # Utilidades
└── globals.css          # Estilos globales
```

## 🎯 Funcionalidades

### Para Estudiantes
- **Exámenes interactivos** con preguntas de opción múltiple
- **Timer en tiempo real** durante el examen
- **Resultados inmediatos** con revisión detallada
- **Navegación entre preguntas** (anterior/siguiente)
- **Barra de progreso** visual

### Para Administradores
- **Panel de administración** completo
- **Gestión de preguntas**: crear, editar, eliminar
- **Filtros avanzados** por categoría y búsqueda de texto
- **Importación masiva** de preguntas via JSON
- **Exportación** del banco de preguntas
- **Estadísticas** del banco de datos

## 📋 Formato de Importación de Preguntas

Para importar preguntas masivamente, usa el siguiente formato JSON:

```json
[
  {
    "question": "¿Cuál es la capital de Francia?",
    "options": [
      "Londres",
      "Madrid", 
      "París",
      "Roma"
    ],
    "correctAnswer": 2,
    "source": "Examen 2024 - Geografía",
    "category": "Geografía Mundial"
  }
]
```

### Campos requeridos:
- `question`: Texto de la pregunta (string)
- `options`: Array con exactamente 4 opciones
- `correctAnswer`: Índice de la respuesta correcta (0-3)
- `source`: Fuente o examen de origen
- `category`: Categoría temática

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta el linter TypeScript

## 📊 Base de Datos

La aplicación utiliza SQLite para almacenar:
- **Preguntas** con sus opciones y metadatos
- **Resultados de exámenes** para estadísticas
- **Categorías** automáticamente detectadas

El archivo de base de datos (`exam-platform.db`) se crea automáticamente al ejecutar la aplicación.

## 🎨 Personalización

### Temas y Colores
Los colores se definen en `src/globals.css` usando variables CSS. Puedes personalizar:
- Colores primarios y secundarios
- Tema claro/oscuro
- Bordes y sombras

### Componentes UI
Los componentes base están en `src/components/ui/` y siguen los estándares de shadcn/ui.

## 🚀 Despliegue

### Build para producción
```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/` listos para ser desplegados en cualquier servidor web.

### Consideraciones para producción
- La base de datos SQLite funciona bien para uso local/pequeña escala
- Para mayor escala, considera migrar a PostgreSQL o MySQL
- Los archivos estáticos pueden servirse desde un CDN

## 🔄 Migración desde la versión anterior

1. **Backup**: Guarda tu archivo `questions-data.js` original
2. **Ejecuta**: `node migrate-questions.js` para importar las preguntas
3. **Verifica**: Abre el panel de administración para confirmar la migración
4. **Personaliza**: Ajusta categorías y fuentes según necesites

## 📖 Uso del Panel de Administración

### Acceder
Navega a `/admin` o usa el botón "Administración" en la barra de navegación.

### Gestionar Preguntas
1. **Ver todas**: Lista completa con filtros
2. **Buscar**: Por texto en pregunta, fuente o categoría  
3. **Editar**: Click en el icono de lápiz
4. **Eliminar**: Click en el icono de basura (con confirmación)
5. **Agregar**: Botón "Nueva Pregunta"

### Importar/Exportar
- **Importar**: Botón "Importar" → selecciona archivo JSON
- **Exportar**: Botón "Exportar" → descarga todas las preguntas

## 💡 Tips y Mejores Prácticas

1. **Categorías consistentes**: Usa nombres de categorías estandarizados
2. **Fuentes detalladas**: Incluye año y tipo de examen en la fuente
3. **Backup regular**: Exporta las preguntas periódicamente
4. **Preguntas claras**: Asegúrate de que las opciones sean inequívocas
5. **Validación**: Revisa las preguntas importadas en el panel de administración

## 🐛 Resolución de Problemas

### La aplicación no inicia
- Verifica que Node.js esté instalado (versión 16+)
- Ejecuta `npm install` para instalar dependencias

### Error de base de datos
- Elimina el archivo `exam-platform.db` para empezar desde cero
- Ejecuta la migración nuevamente

### Problemas de importación
- Verifica que el JSON sea válido
- Asegúrate de que todos los campos requeridos estén presentes
- Revisa que `correctAnswer` esté entre 0 y 3

## 📞 Soporte

Para reportar bugs o solicitar funcionalidades, crea un issue en el repositorio del proyecto.

---

¡Disfruta de tu nueva plataforma de exámenes moderna! 🎉
