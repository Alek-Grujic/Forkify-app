class ResultsView {
  #parentElement = document.querySelector('.results');
  #data;

  render(data) {
    this.#data = data;
    const markup = this._generateMarkup();

    this.#parentElement.innerHTML = '';
    this.#parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  _generateMarkup() {
    return this.#data.map(this._generateMarkupPreview).join('');
  }

  _generateMarkupPreview(recipe) {
    return `
      <li class="preview">
        <a class="preview__link" href="#${recipe.id}">
          <figure class="preview__fig">
            <img src="${recipe.image}" alt="${recipe.title}" />
          </figure>
          <div class="preview__data">
            <h4 class="preview__title">${recipe.title}</h4>
            <p class="preview__publisher">${recipe.publisher}</p>
          </div>
        </a>
      </li>
    `;
  }
}

export default new ResultsView();
