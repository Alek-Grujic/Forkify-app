// NEW API URL (instead of the one shown in the video)
// https://forkify-api.jonas.io

import * as model from './model.js';
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';

import icons from 'url:../img/icons.svg';

const searchField = document.querySelector('.search__field');
const searchBtn = document.querySelector('.search__btn');
const resultsContainer = document.querySelector('.results');
// const paginationContainer = document.querySelector('.pagination');

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

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
    recipeView.renderSpinner();

    await model.loadRecipe(id);

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError(err.message);
  }
};

const controlServings = function (newServings) {
  model.updateServings(newServings);
  recipeView.render(model.state.recipe);
};

recipeView.addHandlerRender(controlRecipe);
recipeView.addHandlerUpdateServings(controlServings);

// render data

const showSearchResults = async function () {
  try {
    const query = searchField.value;
    if (!query) return;

    renderSpinner(resultsContainer);

    await model.loadSearchResults(query);

    renderSearchResultsPage(model.state.search.page);
    searchField.value = '';
  } catch (err) {
    console.error(err);
  }
};

searchBtn.addEventListener('click', function (e) {
  e.preventDefault();
  showSearchResults();
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

const renderSearchResultsPage = function (page) {
  const recipes = model.getSearchResultsPage(page);

  resultsView.render(recipes);
  paginationView.render(model.state.search);
  updateActiveResult();
};
paginationView.addHandlerClick(renderSearchResultsPage);

// paginationContainer.addEventListener('click', function (e) {
//   const btn = e.target.closest('.btn--inline');

//   if (!btn) return;

//   const goToPage = Number(btn.dataset.goto);

//   renderSearchResultsPage(goToPage);
// });
