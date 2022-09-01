(function () {
    //Compile all partials that will be used int the templates

    let headerTemplate = Handlebars.compile(document.getElementById("header-template").innerHTML);
    let recepieTemplate = Handlebars.compile(document.getElementById("recepie-template").innerHTML);
    let ingredientTemplate = Handlebars.compile(document.getElementById("ingredient-template").innerHTML);
    let searchDivTemplate = Handlebars.compile(document.getElementById("searchDiv-template").innerHTML);

    //Register all partials that will be used in the templates
    Handlebars.registerPartial("header", headerTemplate);
    Handlebars.registerPartial("recepie", recepieTemplate);
    Handlebars.registerPartial("ingredient", ingredientTemplate);
    Handlebars.registerPartial("searchDiv", searchDivTemplate);

    //Main listeners
    window.addEventListener("load", router);
    window.addEventListener("hashchange", router);

    //при първоначално зареждане, когато hash реално ни е празен стринг ''
    if (location.hash == '') {
        location.hash = "#allRecepies";
    }

})();

//!Invoke the function (може да се ползва и IIFE)
// registerPartials();


//!Create new recepie
function onCreateRecepieSubmit(e) {
    e.preventDefault();

    let formData = new FormData(document.forms.createRecepieFrom);

    let newRecTitle = formData.get("newRecTitle");
    let newRecLinkToSimilarRec = formData.get("newRecLinkToSimilarRec");
    let newRecIngredients = formData.get("newRecIngredients");
    let newRecImgUrl = formData.get("newRecImgUrl");

    // console.log(newRecTitle, newRecLinkToSimilarRec, newRecIngredients, newRecImgUrl);
    if (newRecTitle.trim() == "" || newRecLinkToSimilarRec.trim() == "" || newRecIngredients.trim() == "" || newRecImgUrl.trim() == "") {
        let createRecErrorP = document.getElementById("createRecErrorP");
        createRecErrorP.style.display = "block";

        setTimeout(() => {
            createRecErrorP.style.display = "none";
        }, 1500);

    } else {
        let newRec = new Recepie(newRecTitle, newRecLinkToSimilarRec, newRecIngredients, newRecImgUrl);
        recepiesManager.add(newRec);
        //redirect to allRecepies
        location.hash("#allRecepies");
    }

}

//!Edit profile
function onEditProfileSubmit(e) {
    e.preventDefault();

    let formData = new FormData(document.forms.changeUserInfoForm);

    let newUsername = formData.get("username");
    let newAge = formData.get("age");
    let newAddress = formData.get("address");
    let newUserImage = formData.get("userImage");


    if (newUsername.trim() == "" || newAge.trim() == "" || newAddress.trim() == "" || newUserImage.trim() == "") {

        let editProfileInfoErrorP = document.getElementById("editProfileInfoErrorP");
        editProfileInfoErrorP.style.display = "block";

        setTimeout(() => {
            editProfileInfoErrorP.style.display = "none";
        }, 1500);

        return;

    } else {
        userStorage.changeUserInfo(newUsername, newAge, newAddress, newUserImage);

    }

}

//!Register
function onRegisterSubmit(e) {
    e.preventDefault();

    let formData = new FormData(document.forms.registerForm);

    let username = formData.get("regUsername");
    let password = formData.get("regPassword");
    let rePassword = formData.get("regRePassword");

    let age = formData.get("regAge");
    let address = formData.get("regAddress");
    let userImage = formData.get("regImage");

    if (username.trim() == "" || password.trim() == "" || rePassword.trim() == "" || age.trim() == "" || address.trim() == "" || userImage.trim() == "") { //ако някой от инпутите е празен стринг
        showNotification("regErrorP", "All fields are requred!");
        return;

    } else { //ако не са празни стрингове - продължаваме проверките надолу

        if (userStorage.existsUser(username)) { //проверяваме дали вече има такъв регистриран юзър
            showNotification("regErrorP", "Username already taken!");
            return;

        } else { //ако името е свободно - проверяваме паролите дали са еднакви

            if (password !== rePassword) {
                showNotification("regErrorP", "Passwords don't match!");
                return;

            } else { //накрая - ако инпутите не са празни, ако името не е заето и ако паролите са еднакви - регистрирай юзъра и редиректни към #allRecepies
                userStorage.addUser(username, password, age, address, userImage);
                location.hash = "#allRecepies";
            }
        }
    }
};

//!Login
function onLoginSubmit(e) {
    e.preventDefault();

    //console.log(document.forms.loginForm); 
    //лесен начин за взимане на формата, която ни трябва, по id="loginForm"
    let formData = new FormData(document.forms.loginForm);
    let username = formData.get("loginUsername");
    let password = formData.get("loginPassword");

    if (userStorage.existsUser(username)) { //проверяваме дали изобщо има такъв регистриран юзър

        if (userStorage.validUser(username, password)) { //после проверяваме дали паролата му е вярна

            userManager.login(username, password); //и, ако е вярна - логваме го

            location.hash = "#allRecepies";
        } else {
            loginErrorP.style.display = "block";
            return;
        }

    } else { //ако човекът не сществува, не може да се логне и трябва да се покаже error
        loginErrorP.style.display = "block";
    }

};

//!Logout
function onLogout(e) {
    e.preventDefault();
    userManager.logout();
    //redirect to logn
    location.hash = "#login";
}

//!Add to favorites or remove from favorites
function addOrRemove(e) {
    e.preventDefault();

    //Get the id of the clicked recepie
    let recepieId = e.target.dataset.id;

    console.log(e.target);

    //If recepie is already liked and in favorites
    if (userManager.recepieIsLiked(recepieId)) {

        //remove recepie id from user favorite recepies
        userManager.removeFromFavorites(recepieId);

        //If location is #favRecepies
        if (location.hash === "#favRecepies") {
            //remove the DOM element now
            e.target.parentElement.parentElement.remove();
        } else { //If not, just change the text content of the clicked button
            e.target.textContent = "Добави в любими";
        }

    } else { //like the recepie
        userManager.addToFavorites(recepieId);
        e.target.textContent = "Премахни от любими";
    }

};


//!Name filtering
function nameFiltering(e) {

    let nameFilteredRecepies;

    let recepieTemplate = Handlebars.compile(document.getElementById("recepie-template").innerHTML);
    let filteredRecepiesHtml = "";

    if (location.hash == "#favRecepies") {
        let favRecepiesContainer = document.getElementById("favRecepies");
        favRecepiesContainer.innerHTML = "";

        nameFilteredRecepies = recepiesManager.allRecepies.filter(recepie => userManager.getUserInfo().favoriteRecepies.includes(recepie.id)).filter(recepie => recepie.title.includes(e.target.value))
        nameFilteredRecepies.forEach(recepie => {
            filteredRecepiesHtml += recepieTemplate(recepie);
        })


        favRecepiesContainer.innerHTML = filteredRecepiesHtml;

    } else { //ако филтрираме в home page
        let allRecepiesContainer = document.getElementById("allRecepies");
        allRecepiesContainer.innerHTML = "";

        nameFilteredRecepies = recepiesManager.filterByName(e.target.value);

        nameFilteredRecepies.forEach(recepie => {
            filteredRecepiesHtml += recepieTemplate(recepie);
        })

        allRecepiesContainer.innerHTML = filteredRecepiesHtml;
    }
};

//!Ingredient filtering
function ingredientFiltering(e) {
    console.log(e.target.selectedOptions["0"].innerText);
    let ingredient = e.target.selectedOptions["0"].innerText;

    let ingredientFilteredRecepies;

    let recepieTemplate = Handlebars.compile(document.getElementById("recepie-template").innerHTML);
    let filteredRecepiesHtml = "";

    if (location.hash == "#favRecepies") {
        let favRecepiesContainer = document.getElementById("favRecepies");
        favRecepiesContainer.innerHTML = "";
        ingredientFilteredRecepies = recepiesManager.allRecepies.filter(rec => userManager.getUserInfo().favoriteRecepies.includes(rec.id)).filter(rec => rec.ingredients.includes(ingredient));

        ingredientFilteredRecepies.forEach(recepie => {
            filteredRecepiesHtml += recepieTemplate(recepie);
        })

        favRecepiesContainer.innerHTML = filteredRecepiesHtml;

    } else { //ако филтрираме в home page
        let allRecepiesContainer = document.getElementById("allRecepies");
        allRecepiesContainer.innerHTML = "";
        ingredientFilteredRecepies = recepiesManager.filterByIngredient(ingredient);

        ingredientFilteredRecepies.forEach(recepie => {
            filteredRecepiesHtml += recepieTemplate(recepie);
        })

        allRecepiesContainer.innerHTML = filteredRecepiesHtml;
    }

}

//!Cook recepie
function cookRecepie(e) {
    //Get the id of the clicked recepie
    let recepieId = e.target.dataset.id;
    userManager.addToCookedRecepies(recepieId);
}

//!Show notification function
function showNotification(elementId, message) {
    console.log(elementId);
    let element = document.getElementById(elementId);
    element.style.display = "block";
    element.textContent = message;

    setTimeout(() => {
        element.style.display = "none";
    }, 1500);

}