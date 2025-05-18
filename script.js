// Get references to HTML elements
const meals = document.getElementById('meals');
const favouriteMealsContainer = document.getElementById('fav-meals');
const searchInput = document.getElementById('searchTerm');
const searchBtn = document.getElementById('search');
const mealPopup = document.getElementById('meal-popup');
const popupCloseBtn = document.getElementById('button-close-popup');
const mealInfo = document.getElementById('meal-info');
let randomMeal = null;

let count = -1; // Unique identifier for tracking displayed meals
const mealsDisplayedIds = []; // Maps index to meal ID


// Retrieve meal IDs from localStorage
const getMealFromLocalStorage = () => {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    if (mealIds == null) {
        return [];
    }
    else {
        return mealIds;
    }
};


// Add a new meal ID to localStorage
const addMealToLocalStorage = (mealId) => {
    const mealIds = getMealFromLocalStorage();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
};


// Remove a meal ID from localStorage
const removeMealFromLocalStorage = (mealId) => {
    const mealIds = getMealFromLocalStorage();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id != mealId)));
};


// Create and display a meal element on the page
const addMeal = (mealData, random = false) => {
    count++; // Increment unique ID tracker
    mealsDisplayedIds.push(mealData.idMeal); // Store meal ID at current index

    const meal = document.createElement('div');
    meal.classList.add('meal');

    // Insert HTML content for meal
    meal.innerHTML = `
                <div class="meal-header">
                    ${random ? `<span class="random">
                    Random Recipe
                </span>` : ''}
                    <img id="${count}" src="${mealData.strMealThumb}" alt="${mealData.strMeal}" onClick="replyClick(this.id)">
                </div>
                <div class="meal-body">
                    <h4 id="${count}" onClick="replyClick(this.id)">${mealData.strMeal}</h4>
                    <button class="fav-btn">
                        <!-- Far (outline) vs. Fas (solid) heart for favorite toggling -->
                           <i class="fas fa-heart"></i>                      
                    </button>
                </div>
    `;

    meals.appendChild(meal);

    // Get reference to heart button inside meal
    const btn = meal.querySelector(".meal-body .fav-btn");
    
    btn.addEventListener("click", () => {
        if(btn.classList.contains('active')) {
            // If already favorite, remove from storage and deactivate button
            removeMealFromLocalStorage(mealData.idMeal);
            btn.classList.remove('active');
        }
        else {
            // Otherwise, add to favorites and activate button
            addMealToLocalStorage(mealData.idMeal);
            btn.classList.add('active');
        }

        // Refresh the favorite meals list
        favouriteMealsContainer.innerHTML = ``;
        fetchFavMeals();
    });

    console.log(count);
    console.log(mealsDisplayedIds);
};


// Called when a meal image/title is clicked, opens popup with detailed info
const replyClick = async(elementId) => {
    const mealId = mealsDisplayedIds[elementId];
    const mealData = await getMealById(mealId);

    // Clear old content
    mealInfo.innerHTML = ``;

    const mealEl = document.createElement('div');
    
    // Build popup content
    mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <p>${mealData.strInstructions}</p>
    <h2>Ingredients</h2>
    <ul id="ingredients">
    </ul>`;
    mealInfo.append(mealEl);

    // Populate ingredients list dynamically
    const ingredientsList = document.getElementById('ingredients');

    for (let i = 1; i <= 20; i++) {
        if(mealData['strIngredient'+i]) {
            if(mealData['strMeasure'+i]) {
                ingredientsList.innerHTML += `<li>${mealData['strIngredient'+i]} ~ ${mealData['strMeasure'+i]}</li>`
            }
            else {
                ingredientsList.innerHTML += `<li>${mealData['strIngredient'+i]}</li>`
            }
        }
        else {
            // End of ingredients
        }
    }

    // Show the popup
    mealPopup.classList.remove('hidden');
}


// Fetch a random meal from the API and display it
const getRandomMeal = async() => {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const responseData = await response.json();
    randomMeal = responseData.meals[0];

    addMeal(randomMeal, true);
};


// Fetch a meal using its unique ID
const getMealById = async(id) => {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);

    const responseData = await response.json();
    const mealData = responseData.meals[0];

    return mealData;
};


// Search for meals matching the given keyword
const getMealBySearch = async(term) => {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+term);

    const responseData = await response.json();
    const mealDataArray = responseData.meals;

    return mealDataArray;
};


// Fetch and display all favorite meals from localStorage
const fetchFavMeals = async() => {
    const mealIds = getMealFromLocalStorage();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];

        const meal = await getMealById(mealId);
        addMealToFav(meal);
    }
};


// Add a meal to the favorites list (left sidebar)
const addMealToFav = (favouriteMealData) => {
    count++;
    mealsDisplayedIds.push(favouriteMealData.idMeal);

    const favMeal = document.createElement('li');

    // Build favorite meal entry
    favMeal.innerHTML = `
    <!--<span> is used to wrap text. Useful in <p> tags, buttons, etc.-->
    <img id="${count}" onClick="replyClick(this.id)" src="${favouriteMealData.strMealThumb}" alt="${favouriteMealData.strMeal}"><span id="${count}" onClick="replyClick(this.id)">${favouriteMealData.strMeal}</span>
    <button class="remove"><i class="fa-solid fa-circle-xmark"></i></button>
    `;

    favouriteMealsContainer.appendChild(favMeal);

    // Add remove-from-favorites functionality
    const btn = favMeal.querySelector('.remove');
    btn.addEventListener("click", () => {
        removeMealFromLocalStorage(favouriteMealData.idMeal);
        favouriteMealsContainer.innerHTML = ``;
        fetchFavMeals(); // Refresh favorites
    });

    // (Unused commented-out code for alternate handlers)
};
