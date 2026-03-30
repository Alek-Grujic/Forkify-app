import icons from 'url:../../img/icons.svg';

class PaginationView {
  #parentElement = document.querySelector('.pagination');
  #data;

  render(data) {
    this.#data = data;
    const markup = this._generateMarkup();

    this.#parentElement.innerHTML = '';
    this.#parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  _generateMarkup() {
    const numPages = Math.ceil(
      this.#data.results.length / this.#data.resultsPerPage,
    );

    const curPage = this.#data.page;

    if (curPage === 1 && numPages > 1) {
      return `
        <button class="btn--inline pagination__btn--next" data-goto="${curPage + 1}">
          <span>Page ${curPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
    }

    if (curPage === numPages && numPages > 1) {
      return `
        <button class="btn--inline pagination__btn--prev" data-goto="${curPage - 1}">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>
      `;
    }

    if (curPage < numPages) {
      return `
        <button class="btn--inline pagination__btn--prev" data-goto="${curPage - 1}">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${curPage - 1}</span>
        </button>

        <button class="btn--inline pagination__btn--next" data-goto="${curPage + 1}">
          <span>Page ${curPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
      `;
    }

    return '';
  }
}

export default new PaginationView();
