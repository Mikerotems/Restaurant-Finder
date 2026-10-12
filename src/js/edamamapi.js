const RECIPE_SEARCH_PATH = "/api/recipes";
const EDAMAM_USER_ID_KEY = "edamam-account-user-id";
let activeSearch = 0;

export async function searchRecipes(query) {
  const results = document.getElementById("recipe_results");
  const status = document.getElementById("recipe_status");
  if (!results || !status) {
    throw new Error("Recipe search results are missing from the page.");
  }

  const searchId = ++activeSearch;
  const searchTerm = query.trim();
  results.replaceChildren();

  if (!searchTerm) {
    status.textContent = "Enter a food or restaurant name to find recipes.";
    return;
  }

  const apiUrl = document
    .querySelector('meta[name="recipe-api-url"]')
    ?.content.trim();
  if (!apiUrl) {
    status.textContent =
      "Recipe search is not configured. Set the recipe API URL after deploying the Render service.";
    return;
  }

  status.textContent = `Searching recipes for "${searchTerm}"...`;

  const params = new URLSearchParams({ q: searchTerm });

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}${RECIPE_SEARCH_PATH}?${params}`,
      {
        headers: {
          "Edamam-Account-User": getEdamamUserId(),
        },
      }
    );
    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage;
      try {
        const errorPayload = JSON.parse(errorBody);
        errorMessage = errorPayload.message ?? errorPayload.error;
      } catch {
        errorMessage = null;
      }
      throw new Error(
        errorMessage ||
          `Edamam recipe search returned HTTP ${response.status}.`
      );
    }

    const data = await response.json();
    if (searchId !== activeSearch) return;

    const hits = Array.isArray(data.hits) ? data.hits : [];
    if (hits.length === 0) {
      status.textContent = `No recipes found for "${searchTerm}".`;
      return;
    }

    renderRecipes(results, hits);
    status.textContent = `Found ${hits.length} recipes for "${searchTerm}".`;
  } catch (error) {
    if (searchId !== activeSearch) return;
    console.error("Recipe search failed:", error);
    status.textContent =
      error instanceof Error
        ? `Recipe search failed: ${error.message}`
        : "Recipe search failed because of an unexpected error.";
  }
}

function getEdamamUserId() {
  let userId = localStorage.getItem(EDAMAM_USER_ID_KEY);
  if (!userId) {
    const randomBytes = new Uint8Array(15);
    crypto.getRandomValues(randomBytes);
    userId = Array.from(randomBytes, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
    localStorage.setItem(EDAMAM_USER_ID_KEY, userId);
  }
  return userId;
}

function renderRecipes(container, hits) {
  const fragment = document.createDocumentFragment();

  for (const hit of hits) {
    const recipe = hit?.recipe;
    if (!recipe || typeof recipe.label !== "string") continue;

    const card = document.createElement("article");
    card.className = "card grid-item recipe-card";

    const imageUrl = getSafeHttpsUrl(recipe.image);
    if (imageUrl) {
      const image = document.createElement("img");
      image.className = "card-img-top card-img";
      image.src = imageUrl;
      image.alt = `${recipe.label} recipe`;
      image.loading = "lazy";
      card.appendChild(image);
    }

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = recipe.label;
    body.appendChild(title);

    if (typeof recipe.source === "string") {
      const source = document.createElement("p");
      source.className = "card-text recipe-source";
      source.textContent = `Source: ${recipe.source}`;
      body.appendChild(source);
    }

    const servings = Number(recipe.yield);
    const calories = Number(recipe.calories);
    if (Number.isFinite(calories) && calories >= 0) {
      const nutrition = document.createElement("p");
      nutrition.className = "card-text";
      const caloriesPerServing =
        Number.isFinite(servings) && servings > 0
          ? Math.round(calories / servings)
          : Math.round(calories);
      nutrition.textContent = `${caloriesPerServing} kcal per serving`;
      body.appendChild(nutrition);
    }

    if (Array.isArray(recipe.ingredientLines) && recipe.ingredientLines.length) {
      const ingredients = document.createElement("p");
      ingredients.className = "card-text";
      ingredients.textContent = `${recipe.ingredientLines.length} ingredients`;
      body.appendChild(ingredients);
    }

    const recipeUrl = getSafeHttpsUrl(recipe.url);
    if (recipeUrl) {
      const link = document.createElement("a");
      link.className = "btn btn-primary";
      link.href = recipeUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View recipe";
      body.appendChild(link);
    }

    card.appendChild(body);
    fragment.appendChild(card);
  }

  container.replaceChildren(fragment);
}

function getSafeHttpsUrl(value) {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
