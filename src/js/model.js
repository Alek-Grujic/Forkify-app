import { API_URL, KEY } from './config.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: 10,
  },
  bookmarks: [],
};

export const loadRecipe = async function (id) {
  const res = await fetch(`https://forkify-api.jonas.io/api/v2/recipes/${id}`);
  const data = await res.json();

  if (!res.ok) throw new Error(`${data.message} (${res.status})`);

  const { recipe: recipeData } = data.data;

  state.recipe = {
    id: recipeData.id,
    title: recipeData.title,
    publisher: recipeData.publisher,
    sourceUrl: recipeData.source_url,
    image: recipeData.image_url,
    servings: recipeData.servings,
    cookingTime: recipeData.cooking_time,
    ingredients: recipeData.ingredients,
  };
  state.recipe.bookmarked = state.bookmarks.some(
    bookmark => bookmark.id === id,
  );
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

export const loadSearchResults = async function (query) {
  state.search.query = query;

  const res = await fetch(
    `https://forkify-api.jonas.io/api/v2/recipes?search=${query}`,
  );
  const data = await res.json();

  if (!res.ok) throw new Error(`${data.message} (${res.status})`);

  state.search.results = data.data.recipes.map(rec => {
    return {
      id: rec.id,
      title: rec.title,
      publisher: rec.publisher,
      image: rec.image_url,
    };
  });

  state.search.page = 1;
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());

        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format :)',
          );

        const [quantity, unit, description] = ingArr;

        return {
          quantity: quantity ? +quantity : null,
          unit,
          description,
        };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    // const res = await fetch(`https://forkify-api.jonas.io/api/v2/recipes`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(recipe),
    // });

    const res = await fetch(`${API_URL}?key=${KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });

    console.log(KEY);
    console.log(`${API_URL}?key=${KEY}`);

    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    const { recipe: recipeData } = data.data;

    state.recipe = {
      id: recipeData.id,
      title: recipeData.title,
      publisher: recipeData.publisher,
      sourceUrl: recipeData.source_url,
      image: recipeData.image_url,
      servings: recipeData.servings,
      cookingTime: recipeData.cooking_time,
      ingredients: recipeData.ingredients,
    };

    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
