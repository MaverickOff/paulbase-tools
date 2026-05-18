/**
 * @fileoverview Aplicación principal de Tools
 * Integra todos los componentes y gestiona el estado global
 */

import { toolsConfig, categories } from './config/tools.js';
import { ToolCard } from './components/ToolCard.js';
import { SearchBar } from './modules/SearchBar.js';
import { CategoryFilter } from './modules/CategoryFilter.js';

class ToolsApp {
  constructor() {
    this.tools = toolsConfig;
    this.filteredTools = [...this.tools];
    this.currentCategory = 'all';
    this.searchQuery = '';

    this.init();
  }

  init() {
    this.setupAnimation();
    this.renderComponents();
    this.setupEventListeners();
  }

  setupAnimation() {
    // requestAnimationFrame asegura que el procesador gráfico del móvil esté listo
    requestAnimationFrame(() => {
      // Ahora sí, esperamos 800ms para darle un respiro al usuario y disparamos
      setTimeout(() => {
        const titulo = document.querySelector('h1');
        if (titulo) {
          // Solo añadimos el "gatillo"
          titulo.classList.add('animar');
        }
      }, 800); // 800ms de retraso
    });
  }

  renderComponents() {
    this.renderSearchBar();
    this.renderCategoryFilter();
    this.renderTools();
    this.updateResultsCounter();
  }

  renderSearchBar() {
    const searchContainer = document.getElementById('search-container');
    if (searchContainer) {
      const searchBar = new SearchBar((query) => this.handleSearch(query));
      searchContainer.appendChild(searchBar.render());
    }
  }

  renderCategoryFilter() {
    const categoriesContainer = document.getElementById('categories-container');
    if (categoriesContainer) {
      const categoryFilter = new CategoryFilter(categories, (categoryId) => this.handleCategoryFilter(categoryId));
      categoriesContainer.appendChild(categoryFilter.render());
    }
  }

  renderTools() {
    const toolsContainer = document.getElementById('tools-container');
    if (!toolsContainer) return;

    // Limpiar contenedor de forma segura
    while (toolsContainer.firstChild) {
      toolsContainer.removeChild(toolsContainer.firstChild);
    }

    if (this.filteredTools.length === 0) {
      this.renderEmptyState(toolsContainer);
      return;
    }

    // Ordenar: destacados primero
    const sortedTools = [...this.filteredTools].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    const fragment = document.createDocumentFragment();

    sortedTools.forEach(tool => {
      const toolCard = new ToolCard(tool);
      fragment.appendChild(toolCard.render());
    });

    toolsContainer.appendChild(fragment);
  }

  renderEmptyState(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';

    const icon = document.createElement('div');
    icon.className = 'empty-state-icon';
    icon.textContent = '🔍';

    const text = document.createElement('div');
    text.className = 'empty-state-text';
    text.textContent = 'No se encontraron herramientas';

    const subtext = document.createElement('div');
    subtext.className = 'empty-state-subtext';
    subtext.textContent = 'Intenta con otra búsqueda o categoría';

    emptyState.appendChild(icon);
    emptyState.appendChild(text);
    emptyState.appendChild(subtext);

    container.appendChild(emptyState);
  }

  updateResultsCounter() {
    const counter = document.getElementById('results-counter');
    if (counter) {
      const total = this.tools.length;
      const showing = this.filteredTools.length;

      if (this.searchQuery || this.currentCategory !== 'all') {
        counter.textContent = `Mostrando ${showing} de ${total} herramientas`;
      } else {
        counter.textContent = `${total} herramientas disponibles`;
      }
    }
  }

  handleSearch(query) {
    this.searchQuery = query.toLowerCase();
    this.applyFilters();
  }

  handleCategoryFilter(categoryId) {
    this.currentCategory = categoryId;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredTools = this.tools.filter(tool => {
      // Filtro por categoría
      const categoryMatch = this.currentCategory === 'all' || tool.category === this.currentCategory;

      // Filtro por búsqueda (nombre, descripción y tags)
      const searchMatch = !this.searchQuery ||
        tool.name.toLowerCase().includes(this.searchQuery) ||
        tool.description.toLowerCase().includes(this.searchQuery) ||
        (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)));

      return categoryMatch && searchMatch;
    });

    this.renderTools();
    this.updateResultsCounter();
  }

  setupEventListeners() {
    // Animación suave al hacer scroll
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop) {
        // Scroll hacia abajo
        document.body.style.paddingTop = '0';
      } else {
        // Scroll hacia arriba
        document.body.style.paddingTop = '0';
      }
      lastScrollTop = st <= 0 ? 0 : st;
    }, false);
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new ToolsApp();
});
