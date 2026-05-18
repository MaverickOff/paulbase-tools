/**
 * @fileoverview Sistema de búsqueda
 * Permite filtrar herramientas por nombre, descripción y etiquetas
 */

export class SearchBar {
  constructor(onSearch) {
    this.onSearch = onSearch;
    this.element = this.create();
  }

  create() {
    const container = document.createElement('div');
    container.className = 'search-container';

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-wrapper';

    const searchIcon = document.createElement('div');
    searchIcon.className = 'search-icon';
    searchIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    `;

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar herramientas...';
    searchInput.className = 'search-input';
    searchInput.setAttribute('aria-label', 'Buscar herramientas');

    searchInput.addEventListener('input', (e) => {
      this.onSearch(e.target.value);
    });

    const clearButton = document.createElement('button');
    clearButton.className = 'search-clear';
    clearButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    clearButton.style.display = 'none';

    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      clearButton.style.display = 'none';
      this.onSearch('');
    });

    searchInput.addEventListener('input', () => {
      clearButton.style.display = searchInput.value ? 'block' : 'none';
    });

    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);
    searchWrapper.appendChild(clearButton);
    container.appendChild(searchWrapper);

    return container;
  }

  render() {
    return this.element;
  }
}
