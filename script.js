const meals = document.getElementById('meals');
const favouriteMealsContainer = document.getElementById('fav-meals');
const searchInput = document.getElementById('searchTerm');
const searchBtn = document.getElementById('search');
const mealPopup = document.getElementById('meal-popup');
const popupCloseBtn = document.getElementById('button-close-popup');
const mealInfo = document.getElementById('meal-info');
let randomMeal = null;

let count = -1;
const mealsDisplayedIds = [];










const getMealFromLocalStorage = () => {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    if (mealIds == null) {
        return [];
    }
    else {
        return mealIds;
    }
};













const addMealToLocalStorage = (mealId) => {
    const mealIds = getMealFromLocalStorage();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
};















const removeMealFromLocalStorage = (mealId) => {
    const mealIds = getMealFromLocalStorage();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id != mealId)));
};















const addMeal = (mealData, random = false) => {
    count++;
    mealsDisplayedIds.push(mealData.idMeal);
    const meal = document.createElement('div');
    meal.classList.add('meal');

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
                        <!--Idea is to have far fa-heart (hollow heart) and then when we click, we will have fas fa-heart (filled heart)-->
                           <i class="fas fa-heart"></i>                      
                    </button>
                </div>
    `;

    meals.appendChild(meal);

    // querySelector can work with buttons as well as checkboxes.
    const btn = meal.querySelector(".meal-body .fav-btn");
    
    btn.addEventListener("click", () => {
        if(btn.classList.contains('active')) {
            removeMealFromLocalStorage(mealData.idMeal);
            btn.classList.remove('active');
        }
        else {
            addMealToLocalStorage(mealData.idMeal);
            btn.classList.add('active');
        }

        favouriteMealsContainer.innerHTML = ``;
        fetchFavMeals();
    });

    console.log(count);
    console.log(mealsDisplayedIds);
};






const replyClick = async(elementId) => {
    const mealId = mealsDisplayedIds[elementId];
    const mealData = await getMealById(mealId);


    mealInfo.innerHTML = ``;

    const mealEl = document.createElement('div');
    
    mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <p>${mealData.strInstructions}</p>
    <h2>Ingredients</h2>
    <ul id="ingredients">
    </ul>`;
    mealInfo.append(mealEl);


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
            //do nothing
        }
    }

    mealPopup.classList.remove('hidden');
}









//async allows the program to execute a potentially long-running task while still being able to deal with other function calls.
const getRandomMeal = async() => {
    //make sure to include 'https' when using the fetch method
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const responseData = await response.json();
    randomMeal = responseData.meals[0];

    addMeal(randomMeal, true);
};










const getMealById = async(id) => {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);

    const responseData = await response.json();
    const mealData = responseData.meals[0];

    return mealData;
};









const getMealBySearch = async(term) => {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+term);

    const responseData = await response.json();
    const mealDataArray = responseData.meals;

    return mealDataArray;
};















const fetchFavMeals = async() => {
    const mealIds = getMealFromLocalStorage();


    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];

        const meal = await getMealById(mealId);
        addMealToFav(meal);
    }
};












const addMealToFav = (favouriteMealData) => {
    count++;
    mealsDisplayedIds.push(favouriteMealData.idMeal);
    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
    <!--<span> is used to manipulate certain texts within larger blocks of text. Commonly used within <p> tags.-->
    <img id="${count}" onClick="replyClick(this.id)" src="${favouriteMealData.strMealThumb}" alt="${favouriteMealData.strMeal}"><span id="${count}" onClick="replyClick(this.id)">${favouriteMealData.strMeal}</span>
    <button class="remove"><i class="fa-solid fa-circle-xmark"></i></button>
    `;

    favouriteMealsContainer.appendChild(favMeal);

    const btn = favMeal.querySelector('.remove');
    btn.addEventListener("click", () => {
        removeMealFromLocalStorage(favouriteMealData.idMeal);

        favouriteMealsContainer.innerHTML = ``;
        fetchFavMeals();
    });

    /*const favImg = document.getElementById('fav-img');
    const favTitle = document.getElementById('fav-title');

    favImg.addEventListener("click", () => {
        displayMealInfo(favouriteMealData);
    });

    favTitle.addEventListener("click", () => {
        displayMealInfo(favouriteMealData);
    });*/

};






searchBtn.addEventListener('click', async() => {
    searchTerm = searchInput.value;

    const searchResults = await getMealBySearch(searchTerm);

    if(!searchResults) {
        alert("No recipes found for " + searchTerm);
    }
    else {
        meals.innerHTML = ``;
        addMeal(randomMeal, true);
        for (let i = 0; i < searchResults.length; i++) {
            addMeal(searchResults[i]);
        }
    }
});












popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add('hidden');
});









getRandomMeal();
fetchFavMeals();