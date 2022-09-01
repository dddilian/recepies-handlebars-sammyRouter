let userManager = (function () {

    class UserManager {
        constructor() {}

        //!TO DO
        register(user) {
            userStorage.addUser(...Object.values(user))
        };

        login(username, password) {
            if (userStorage.validUser(username, password)) {
                let user = userStorage.getUser(username);
                localStorage.setItem("currentUser", JSON.stringify(user));
            }
        };

        logout() {
            //презапиши всички юзъри в localStorage, заедно с последно модифицирания, за да може да се запази актуалното му състояние
            localStorage.setItem('users', JSON.stringify(userStorage.users));
            //след това разкарай юзъра, с който последно е работено
            localStorage.removeItem("currentUser");
        };

        getUserInfo() {
            return JSON.parse(localStorage.getItem("currentUser"));
        };

        updateUser(currentUser) {
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
        };

        addToFavorites(recepieId) {

            let currentUser = this.getUserInfo();
            let user = userStorage.getUser(currentUser.username);

            if (!this.recepieIsLiked(recepieId)) { //ако не се съдържа
                user.favoriteRecepies.push(recepieId); //добави id-то на конкретната рецепта в любимите на конкретния юзър
                this.updateUser(user); //записваме промяната в localStorage
            } else {
                return;
            }

        };

        removeFromFavorites(recepieId) {

            let currentUser = this.getUserInfo();
            let user = userStorage.getUser(currentUser.username);

            //find index of current recepie id
            let idx = user.favoriteRecepies.indexOf(recepieId);
            //remove the recepie id on that index
            user.favoriteRecepies.splice(idx, 1);

            this.updateUser(user); //записваме промяната в localStorage
        };


        addToCookedRecepies(recepieId) {

            let currentUser = this.getUserInfo();
            let user = userStorage.getUser(currentUser.username);

            let currentRecepie = recepiesManager.allRecepies.find(recepie => recepie.id === recepieId);

            if (user.coockedRecepies[currentRecepie.title]) { //ако рецептата е готвена поне веднъж, увеличи броя готвевия
                user.coockedRecepies[currentRecepie.title]++;
            } else {
                user.coockedRecepies[currentRecepie.title] = 1; //ако рецептата досега не е готвена, създай такова пропърти със стойност 1
            }

            this.updateUser(user); //записваме промяната в localStorage
        };

        recepieIsLiked(recepieId) {

            let currentUser = this.getUserInfo();
            let user = userStorage.getUser(currentUser.username);

            return user.favoriteRecepies.includes(recepieId);
        };

    }


    return new UserManager();
})();