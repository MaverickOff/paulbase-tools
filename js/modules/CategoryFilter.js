/**
 * @fileoverview Sistema de categorías
 * Permite filtrar herramientas por categoría
 */

export class CategoryFilter {
  constructor(categories, onFilter) {
    this.categories = categories;
    this.onFilter = onFilter;
    this.activeCategory = 'all';
    this.element = this.create();
  }

  create() {
    const container = document.createElement('div');
    container.className = 'category-filter';

    this.categories.forEach(category => {
      const button = document.createElement('button');
      button.className = `category-btn ${category.id === 'all' ? 'active' : ''}`;
      button.dataset.category = category.id;
      button.innerHTML = `
        <span class="category-icon">${category.icon}</span>
        <span class="category-name">${category.name}</span>
      `;

      button.addEventListener('click', () => {
        this.setActiveCategory(category.id);
        this.onFilter(category.id);
      });

      container.appendChild(button);
    });

    return container;
  }

  setActiveCategory(categoryId) {
    this.activeCategory = categoryId;

    const buttons = this.element.querySelectorAll('.category-btn');
    buttons.forEach(button => {
      if (button.dataset.category === categoryId) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  render() {
    return this.element;
  }
}
