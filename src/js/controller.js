import * as model from './model.js';

const recipeContainer = document.querySelector('.recipe');
const searchField = document.querySelector('.search__field');
const searchBtn = document.querySelector('.search__btn');
const resultsContainer = document.querySelector('.results');
const paginationContainer = document.querySelector('.pagination');

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

import icons from 'url:../img/icons.svg';

let recipe;

// NEW API URL (instead of the one shown in the video)
// https://forkify-api.jonas.io

///////////////////////////////////////

let searchResults = [];
let currentPage = 1;
const resultsPerPage = 10;

const renderSpinner = function (parentEl) {
  const markup = `
    <div class="spinner">
      <svg>
        <use href="${icons}#icon-loader"></use>
      </svg>
    </div>
  `;

  parentEl.innerHTML = '';
  parentEl.insertAdjacentHTML('afterbegin', markup);
};

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    updateActiveResult();
    renderSpinner(recipeContainer);

    await model.loadRecipe(id);

    renderRecipe(model.state.recipe);
  } catch (err) {
    renderError(err.message);
  }
};

window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);

// render data

const renderRecipe = function (recipe) {
  const ingredientsMarkup = recipe.ingredients
    .map(
      ing => `
      <li class="recipe__ingredient">
        <svg class="recipe__icon">
          <use href="${icons}#icon-check"></use>
        </svg>
        <div class="recipe__quantity">${ing.quantity ?? ''}</div>
        <div class="recipe__description">
          <span class="recipe__unit">${ing.unit ?? ''}</span>
          ${ing.description}
        </div>
      </li>
    `,
    )
    .join('');

  const markup = `
    <figure class="recipe__fig">
      <img src="${recipe.image}" alt="${recipe.title}" class="recipe__img" />
      <h1 class="recipe__title">
        <span>${recipe.title}</span>
      </h1>
    </figure>

    <div class="recipe__details">
    <div class="recipe__info">
    <svg class="recipe__info-icon">
      <use href="${icons}#icon-clock"></use>
    </svg>
    <span class="recipe__info-data recipe__info-data--minutes">${recipe.cookingTime}</span>
    <span class="recipe__info-text">minutes</span>
    </div>

    <div class="recipe__info">
    <svg class="recipe__info-icon">
      <use href="${icons}#icon-users"></use>
    </svg>
    <span class="recipe__info-data recipe__info-data--people">${recipe.servings}</span>
    <span class="recipe__info-text">servings</span>

    <div class="recipe__info-buttons">
      <button class="btn--tiny btn--increase-servings" data-update-to="${recipe.servings - 1}">
        <svg>
          <use href="${icons}#icon-minus-circle"></use>
        </svg>
      </button>
      <button class="btn--tiny btn--increase-servings" data-update-to="${recipe.servings + 1}">
        <svg>
          <use href="${icons}#icon-plus-circle"></use>
        </svg>
      </button>
      </div>
    </div>
    </div>

    <div class="recipe__ingredients">
      <h2 class="heading--2">Recipe ingredients</h2>
      <ul class="recipe__ingredient-list">
        ${ingredientsMarkup}
      </ul>
    </div>

    <div class="recipe__directions">
    <h2 class="heading--2">How to cook it</h2>
    <p class="recipe__directions-text">
    This recipe was carefully designed and tested by
    <span class="recipe__publisher">${recipe.publisher}</span>. Please check out
    directions at their website.
    </p>
    <a
    class="btn--small recipe__btn"
    href="${recipe.sourceUrl}"
    target="_blank"
    >
    <span>Directions</span>
    <svg class="search__icon">
      <use href="${icons}#icon-arrow-right"></use>
    </svg>
    </a>
    </div>
  `;

  recipeContainer.innerHTML = '';
  recipeContainer.insertAdjacentHTML('afterbegin', markup);
};

recipeContainer.addEventListener('click', function (e) {
  const btn = e.target.closest('.btn--increase-servings');

  if (!btn) return;

  const newServings = Number(btn.dataset.updateTo);

  if (newServings > 0) {
    model.updateServings(newServings);
    renderRecipe(model.state.recipe);
  }
});

const renderError = function (message = `Something went wrong!`) {
  const markup = `
    <div class="error">
      <div>
        <svg>
          <use href="${icons}#icon-alert-triangle"></use>
        </svg>
      </div>
      <p>${message}</p>
    </div>
  `;

  recipeContainer.innerHTML = '';
  recipeContainer.insertAdjacentHTML('afterbegin', markup);
};

const showSearchResults = async function () {
  try {
    const query = searchField.value;
    if (!query) return;

    renderSpinner(resultsContainer);

    await model.loadSearchResults();

    renderSearchResultsPage(currentPage);
    searchField.value = '';
  } catch (err) {
    console.error(err);
  }
};

searchBtn.addEventListener('click', function (e) {
  e.preventDefault();
  showSearchResults();
});

const renderRecipePreview = function (recipe) {
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
};

const renderSearchResults = function (recipes) {
  const markup = recipes.map(renderRecipePreview).join('');

  resultsContainer.innerHTML = '';
  resultsContainer.insertAdjacentHTML('afterbegin', markup);
};

window.addEventListener('hashchange', function () {
  console.log(location.hash);
});

const updateActiveResult = function () {
  const results = document.querySelectorAll('.preview__link');

  results.forEach(link => link.classList.remove('preview__link--active'));

  const activeLink = document.querySelector(
    `.preview__link[href="${window.location.hash}"]`,
  );

  if (activeLink) activeLink.classList.add('preview__link--active');
};

// pagination

const getSearchResultsPage = function (page) {
  const start = (page - 1) * resultsPerPage;
  const end = page * resultsPerPage;

  return searchResults.slice(start, end);
};

const renderSearchResultsPage = function (page) {
  currentPage = page;

  const recipes = getSearchResultsPage(page);
  renderSearchResults(recipes);
  renderPagination(page);
  updateActiveResult();
};

const createPaginationButton = function (page, type) {
  return `
    <button class="btn--inline pagination__btn--${type}" data-goto="${page}">
      <span>Page ${page}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-${type === 'prev' ? 'left' : 'right'}"></use>
      </svg>
    </button>
  `;
};

const renderPagination = function (page) {
  const numPages = Math.ceil(searchResults.length / resultsPerPage);

  let markup = '';

  if (page === 1 && numPages > 1) {
    markup = createPaginationButton(page + 1, 'next');
  } else if (page === numPages && numPages > 1) {
    markup = createPaginationButton(page - 1, 'prev');
  } else if (page < numPages) {
    markup =
      createPaginationButton(page - 1, 'prev') +
      createPaginationButton(page + 1, 'next');
  }

  paginationContainer.innerHTML = '';
  paginationContainer.insertAdjacentHTML('afterbegin', markup);
};

paginationContainer.addEventListener('click', function (e) {
  const btn = e.target.closest('.btn--inline');

  if (!btn) return;

  const goToPage = Number(btn.dataset.goto);

  renderSearchResultsPage(goToPage);
});
