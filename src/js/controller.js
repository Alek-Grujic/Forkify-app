const recipeContainer = document.querySelector('.recipe');

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

import icons from 'url:../img/icons.svg';

// NEW API URL (instead of the one shown in the video)
// https://forkify-api.jonas.io

///////////////////////////////////////

const showRecipe = async function () {
  try {
    const res = await fetch(
      'https://forkify-api.jonas.io/api/v2/recipes/5ed6604591c37cdc054bc886',
    );
    const data = await res.json();

    console.log(res, data);

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    let { recipe } = data.data;
    recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
    };

    console.log(recipe);
    renderRecipe(recipe);
  } catch (err) {
    alert(err);
  }
};

showRecipe();

// render data

recipeContainer.innerHTML = '';

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

    <div class="recipe__ingredients">
      <h2 class="heading--2">Recipe ingredients</h2>
      <ul class="recipe__ingredient-list">
        ${ingredientsMarkup}
      </ul>
    </div>
  `;

  recipeContainer.innerHTML = '';
  recipeContainer.insertAdjacentHTML('afterbegin', markup);
};
