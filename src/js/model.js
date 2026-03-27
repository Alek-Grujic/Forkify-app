export const state = {
  recipe: {},
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
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};
