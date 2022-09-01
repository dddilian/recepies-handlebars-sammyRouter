const routes = {
    //id-тата на темплейтите
    "allRecepies": "allRecepiesPage-template",
    "favRecepies": "favoriteRecepiesPage-template",
    "login": "loginPage-template",
    "register": `registerPage-template`,
    "myProfile": "profilePage-template",
    "createRecepie": "createRecepiePage-template"

}

function router(recepies) {

    let context = {
        user: userManager.getUserInfo(),
        ingredients: recepiesManager.getAllIngredients(),
    };


    let mainContainer = document.getElementById("mainContainer");
    let hash = location.hash.slice(1);

    switch (hash) {

        case "allRecepies":

            if (context.user) { //ако има логнат юзър
                recepiesManager.allRecepies.forEach(rec => {
                    if (context.user.favoriteRecepies.includes(rec.id)) {
                        rec.isLiked = true;
                    } else {
                        rec.isLiked = false;
                    }
                });
            }

            context.recepies = recepiesManager.allRecepies;

            break;

        case "favRecepies":

            context.favRecepies = recepiesManager.allRecepies.filter(rec => {
                if (context.user.favoriteRecepies.includes(rec.id)) {
                    rec.isLiked = true;
                    return rec;
                }
            });

            break;

        case "createRecepie":

            break;

        case "myProfile":
            //трябва обекта с coocked recepies в user, да стане масив от обекти, съсоящи се от recepie title и брой готвения
            let coockedRecepies = [];
            for (const title in context.user.coockedRecepies) {
                let newObj = {
                    title: title,
                    timesCooked: context.user.coockedRecepies[title]
                }
                coockedRecepies.push(newObj);
            }

            context.coockedRecepies = coockedRecepies;
            // console.log(coockedRecepies);
            // console.log(context.user.address);
            break;

        case "login":

            break;

        case "register":

            break;

        default:

            break;
    }

    console.log(hash);
    let template = Handlebars.compile(document.getElementById(routes[hash]).innerHTML); //взимаме си темплейта от routes по path

    mainContainer.innerHTML = template(context);

}