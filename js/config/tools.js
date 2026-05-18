/**
 * @fileoverview Configuración centralizada de herramientas
 * Sistema de datos para facilitar la gestión y escalabilidad del proyecto
 *
 * Cada herramienta es un objeto con la siguiente estructura:
 * - id: Identificador único (string, kebab-case)
 * - name: Nombre visible (string)
 * - description: Descripción breve (string)
 * - icon: Emoji o icono representativo (string)
 * - url: Ruta dentro de /tools/ o URL externa (string)
 * - category: Categoría para filtrar (string, ver `categories`)
 * - featured: Destacado (boolean)
 * - tags: Etiquetas para búsqueda (array de strings)
 */

export const toolsConfig = [
  {
    id: 'password-hash',
    name: 'Generador de Contraseñas y Hashes',
    description: 'Genera contraseñas seguras y hashes (MD5, SHA-256, SHA-512, Bcrypt). Longitud configurable con opciones de caracteres.',
    icon: '🔐',
    url: '/tools/password-hash',
    category: 'security',
    featured: true,
    tags: ['password', 'hash', 'security', 'sha', 'md5', 'bcrypt']
  },
  {
    id: 'permissions',
    name: 'Traductor Visual de Permisos Linux',
    description: 'Convierte notación numérica (777) a simbólica (rwxrwxrwx) y viceversa. Visualización interactiva con colores.',
    icon: '🐧',
    url: '/tools/permissions',
    category: 'system',
    featured: true,
    tags: ['chmod', 'permissions', 'linux', 'rwx', 'unix']
  },
  {
    id: 'cron-generator',
    name: 'Generador de Cronjobs',
    description: 'Construye expresiones cron de forma visual. Selecciona minutos, horas, días y obtén la sintaxis correcta + descripción en español.',
    icon: '⏰',
    url: '/tools/cron-generator',
    category: 'system',
    featured: false,
    tags: ['cron', 'schedule', 'crontab', 'automation', 'task']
  },
  {
    id: 'subnet-calculator',
    name: 'Calculadora de Subredes IPv4 / CIDR',
    description: 'Calcula rangos de red, broadcast, máscara, hosts disponibles y wildcard desde cualquier dirección IP y máscara CIDR.',
    icon: '📡',
    url: '/tools/subnet-calculator',
    category: 'network',
    featured: false,
    tags: ['subnet', 'ip', 'cidr', 'network', 'ipv4', 'calculator']
  }
];

export const categories = [
  { id: 'all', name: 'Todas', icon: '🔧' },
  { id: 'security', name: 'Seguridad', icon: '🔒' },
  { id: 'system', name: 'Sistemas', icon: '⚙️' },
  { id: 'network', name: 'Redes', icon: '📡' }
];
