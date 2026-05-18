/**
 * @fileoverview Componente ToolCard
 * Genera tarjetas de herramientas de forma dinámica (construcción DOM nativa)
 */

export class ToolCard {
  constructor(tool) {
    this.tool = tool;
  }

  render() {
    const card = document.createElement('div');
    card.className = `tool-card ${this.tool.featured ? 'featured' : ''}`;
    card.dataset.category = this.tool.category;
    card.dataset.id = this.tool.id;

    // Header
    const header = document.createElement('div');
    header.className = 'tool-header';

    const icon = document.createElement('div');
    icon.className = 'tool-icon';
    icon.textContent = this.tool.icon;
    header.appendChild(icon);

    if (this.tool.featured) {
      const badge = document.createElement('span');
      badge.className = 'featured-badge';
      badge.textContent = '⭐ Destacado';
      header.appendChild(badge);
    }

    // Content
    const content = document.createElement('div');
    content.className = 'tool-content';

    const title = document.createElement('h3');
    title.className = 'tool-name';
    title.textContent = this.tool.name;
    content.appendChild(title);

    const description = document.createElement('p');
    description.className = 'tool-description';
    description.textContent = this.tool.description;
    content.appendChild(description);

    const meta = document.createElement('div');
    meta.className = 'tool-meta';

    const category = document.createElement('span');
    category.className = 'tool-category';
    category.textContent = `${this.getCategoryIcon()} ${this.getCategoryName()}`;
    meta.appendChild(category);

    content.appendChild(meta);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'tool-footer';

    const link = document.createElement('a');
    link.href = this.tool.url;
    link.className = 'btn btn-primary tool-btn';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M5 12h14M12 5l7 7-7 7');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');

    svg.appendChild(path);

    link.appendChild(document.createTextNode('Abrir herramienta '));
    link.appendChild(svg);
    footer.appendChild(link);

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(footer);

    return card;
  }

  getCategoryIcon() {
    const categoryIcons = {
      'security': '🔒',
      'system': '⚙️',
      'network': '📡',
      'development': '💻',
      'productivity': '📈'
    };
    return categoryIcons[this.tool.category] || '🔧';
  }

  getCategoryName() {
    const categoryNames = {
      'security': 'Seguridad',
      'system': 'Sistemas',
      'network': 'Redes',
      'development': 'Desarrollo',
      'productivity': 'Productividad'
    };
    return categoryNames[this.tool.category] || 'General';
  }
}
