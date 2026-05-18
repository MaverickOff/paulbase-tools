# Paulbase Tools - Documentación del Proyecto

## Visión General
Paulbase Tools es una colección web minimalista que alberga herramientas útiles para desarrolladores y profesionales de TI. El proyecto está diseñado para ser escalable, seguro y fácil de mantener, siguiendo las mejores prácticas de desarrollo frontend.

## Estructura del Proyecto
```
paulbase-tools/
├── index.html                 # Página principal
├── CLAUDE.md                  # Documentación (este archivo)
├── css/
│   ├── base.css              # Variables globales y reset
│   ├── style.css             # Importador principal de estilos
│   └── components/
│       ├── cards.css         # Estilos para tarjetas de herramientas
│       └── header.css        # Efectos visuales del header
├── js/
│   ├── app.js                # Aplicación principal
│   ├── config/
│   │   └── tools.js          # Configuración de herramientas y categorías
│   ├── components/
│   │   └── ToolCard.js       # Componente para tarjetas de herramientas
│   ├── modules/
│   │   ├── SearchBar.js      # Sistema de búsqueda
│   │   └── CategoryFilter.js # Filtro por categorías
│   └── pages/                # Páginas individuales de herramientas (opcional)
└── tools/                    # Directorios para cada herramienta
    ├── password-hash/
    │   ├── index.html
    │   └── style.css
    ├── permissions/
    │   ├── index.html
    │   └── style.css
    ├── cron-generator/
    │   ├── index.html
    │   └── style.css
    └── subnet-calculator/
        ├── index.html
        └── style.css
```

## Tecnologías Utilizadas
- **HTML5** semántico
- **CSS3** con variables CSS (custom properties)
- **JavaScript ES6+** con módulos nativos
- **Bootstrap 5** solo para reset básico y utilidades
- **Animaciones CSS** nativas (sin dependencias adicionales)
- **Diseño responsive** con CSS Grid y Flexbox

## Principios de Diseño

### Escalabilidad
1. Cada herramienta se agrega mediante un objeto en `js/config/tools.js`
2. El sistema de filtrado y búsqueda es genérico
3. Los componentes UI son reutilizables
4. Las páginas de herramientas siguen un layout consistente

### Seguridad
1. Content Security Policy estricta en el index.html
2. Solo se permiten recursos del mismo origen y CDNs confiables
3. Uso de `rel="noopener"` implícito en enlaces externos
4. Evitación de `innerHTML` donde es posible, usando creación de elementos DOM

### Rendimiento
1. Carga diferida de JavaScript con `type="module"`
2. Animaciones optimizadas con `transform` y `opacity`
3. CSS minimalista sin frameworks pesados
4. Uso de variables CSS para temas consistentes

## Cómo Agregar una Nueva Herramienta

### Paso 1: Definir la herramienta en tools.js
1. Abre `js/config/tools.js`
2. Añade un nuevo objeto al array `toolsConfig`:
```javascript
{
  id: 'identificador-unico',
  name: 'Nombre de la Herramienta',
  description: 'Descripción breve de qué hace',
  icon: '🔧', // Emoji representativo
  url: './tools/tu-herramienta', // Ruta relativa
  category: 'categoria-existente-o-nueva',
  featured: false, // O true si quieres destacar
  tags: ['etiqueta1', 'etiqueta2'] // Para búsqueda
}
```

### Paso 2: Añadir categoría (si es nueva)
1. En el mismo archivo, añade al array `categories`:
```javascript
{ id: 'nueva-categoria', name: 'Nombre Categoría', icon: '🎯' }
```

### Paso 3: Crear el directorio de la herramienta
1. Dentro de `tools/`, crea una carpeta con el nombre de tu herramienta
2. Dentro de ella, crea:
   - `index.html`: Estructura básica con layout estándar
   - `style.css`: Estilos específicos (hereda del layout base)

### Paso 4: Implementar el layout estándar
Cada herramienta debe usar este layout base:
```html
<div class="tool-layout">
  <header class="tool-header-bar">
    <a href="../../" class="back-link">
      <!-- Flecha izquierda SVG -->
      Volver
    </a>
    <span class="tool-title">Paulbase Tools</span>
  </header>

  <main class="tool-content-area">
    <!-- Contenido específico de la herramienta -->
  </main>
</div>
```

## Guidelines de Código

### CSS
- Usa las variables CSS definidas en `:root` en `base.css`
- Para colores específicos de herramientas, crea variables con el prefijo `--tool-`
- Evita `!important` excepto para overrides de Bootstrap
- Usa nombres de clases descriptivos en kebab-case
- Agrupa estilos relacionados con comentarios de sección

### JavaScript
- Usa ES6+ módulos nativos (`import`/`export`)
- Nombra clases en PascalCase, funciones y variables en camelCase
- Mantén los componentes pequeños y enfocados en una responsabilidad
- Usa delegación de eventos cuando sea apropiado
- No manipules directamente estilos inline, usa clases CSS

### HTML
- Usa semantic HTML5 adecuado
- Incluye siempre atributos `lang` y `meta viewport`
- Proporciona texto alternativo para iconos cuando sea necesario
- Usa etiquetas semánticas como `<header>`, `<main>`, `<section>`

## Buenas Prácticas

### Para Desarrolladores
1. **Consistencia**: Sigue los patrones existentes en el código
2. **Simplicidad**: Prefiere soluciones simples sobre abstracciones innecesarias
3. **Documentación**: Comenta por qué, no qué (el código autoexplicativo)
4. **Testing**: Verifica en múltiples tamaños de pantalla
5. **Accesibilidad**: Considera contraste y navegación con teclado

### Para Mantenimiento
1. **Versionado**: Usa commits descriptivos y semver cuando sea apropiado
2. **Changelog**: Actualiza CHANGELOG.md con cambios significativos
3. **Deprecado**: Marca claramente funcionalidades obsoletas antes de removerlas
4. **Dependencias**: Minimiza dependencias externas; revisa licencias

## Despliegue
El sitio es completamente estático y puede deployarse en cualquier servidor web o plataforma estática:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Cualquier servidor HTTP tradicional

No requiere build process, bases de datos ni configuración especial.

## Próximos Pasos Sugeridos
1. Implementar funcionalidad real para cada herramienta
2. Añadir tests unitarios para la lógica de negocio
3. Implementar servicio worker para funcionalidad offline
4. Añadir i18n básico (es/en)
5. Crear tema oscuro/claro basado en preferencia del sistema
6. Implementar tracking de uso anónimo (opcional)

---
*Documentación generada como parte del setup inicial del proyecto paulbase-tools*