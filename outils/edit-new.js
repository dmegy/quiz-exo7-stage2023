
    /**
     * Fonction qui normalise une chaîne de caractères en retirant les accents et les majuscules
     * 
     * @param {string} str - La chaîne de caractères à normaliser
     * @returns {string} La chaîne de caractères normalisée
     */
    function normalizeString(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Fonction qui change les résultats de recherche des questions en fonction des filtres de mots
     * 
     * @param {event} event - Bouton du clavier appuyé
     */
    function handleKeyPress(event) {
        affichageResultatsRecherche();
    }

    /** 
     * Fonction déterminant tous les mots de recherche entrés par l'utilisateur en coupant la chaîne de caractères initiale
     * sur les caractères d'espace
     * 
     * @param {string} str - La chaîne de caractères contenant les mots
     * @returns {array} - Une liste dont les éléments sont chaque mot
     */
    function getMotsDeRecherche(str) {
        return str.split(/\s+/);
    }

    /** 
     * Fonction qui teste si tous les mots d'une liste sont présents dans une chaîne de caractère
     * 
     * @param {string} str - La chaîne de caractères où on vérifie la présence des mots
     * @param {string[]} wordsArray - La liste de mots dont on vérifie la présence
     * @returns {boolean} True si tous les mots sont présents dans la chaîne de caractères, false sinon.
     */
    function testPresenceMotsAll(str, wordsArray) {
        const lowerCaseString = str.toLowerCase();

        for (let word of wordsArray) {
            const lowerCaseWord = word.toLowerCase();

            if (!lowerCaseString.includes(lowerCaseWord)) {
                return false;
            }
        }
        return true;
    }


    /**
     * Fonction qui récupère les données du fichier JSON et les stocke dans 2 listes. Une liste contenant les données
     * brutes (peut être utile pour d'éventuelles futures fonctionnalités) et une liste contenant le texte des questions.
     * Puis appel des fonctions prechargerListeQuestionsSelectionnees() et affichageResultatsRecherche()
     *  
     */
    async function fetchData() {
        itemsContainer.innerHTML = "";
        await fetch('https://raw.githubusercontent.com/Phil1010/quiz-exo7-stage2023/main/catalogue.json')
        .then(response => response.json())
        .then(data => {
            dataQuestions = data;
            data.forEach((element, index) => {
                texteQuestions.push(element.texte);
            });
            console.log(`${data.length} questions téléchargées`);
            prechargerListeQuestionsSelectionnees();
            affichageResultatsRecherche();
        });
    }


    /**
     * Fonction qui affiche les questions dans le div "resultats de la recherche"
     */
    async function affichageResultatsRecherche() {
        itemsContainer.innerHTML = "";
        const searchString = normalizeString(motRechercher.value.trim().replace(/\s+/g, ' '));
        const listeMots = getMotsDeRecherche(searchString);

        dataQuestions.forEach((element, index) => {
            const normalizedText = normalizeString(element.texte);
            // Si : (mode "ET" activé et tous les mots sont présents) ou (mode "OU" activé et au moins un mot est présent)
            if (testPresenceMotsAll(normalizedText, listeMots)) {
                // Vérifier si l'élément est déjà dans la liste des questions sélectionnées
                const isAlreadySelected = questionsSelectionnees.some(q => q.number === index);
                if (!isAlreadySelected) {
                    resultatsDeRecherche.push(element);
                    itemsContainer.appendChild(createBoiteQuestion(index, element.texte));
                }
            }
        });
    }



    /**
     * Fonction qui crée une boîte de question
     * 
     * @param {number} number - Le numéro de la question
     * @param {string} text - Le texte de la question
     * @returns {HTMLElement} La boîte de question complète
     */
    function createBoiteQuestion(number, text) {
        const card = document.createElement("div");
        // card.className = "card";

        const items = document.createElement("div");
        // items.className = "row valign-wrapper ";
        items.style.margin = "1%";
        items.style.display = "flex";
        items.style.alignItems = "center";
        items.style.justifyContent = "space-between"; // Align items to the start and end of the div

        // const enonce = document.createElement("div");
        // // enonce.className = "col s10";
        // enonce.textContent = <strong>number</strong> + ". " + text;

        const enonce = document.createElement("div");
        const numberElement = document.createElement("strong");
        numberElement.textContent = number;
        enonce.appendChild(numberElement);
        enonce.appendChild(document.createTextNode(". " + text));

        const boutonAjouter = document.createElement("button");
        boutonAjouter.style.marginLeft = "50px";
        boutonAjouter.style.flexShrink = "0";
        boutonAjouter.style.width = "28px";
        boutonAjouter.style.height = "28px";
        boutonAjouter.textContent = "＋";
        // boutonAjouter.style.display = "flex";
        // boutonAjouter.style.alignItems = "center";

        boutonAjouter.addEventListener("click", () => {
            const question = {
                number: number,
                text: text
            };
            questionsSelectionnees.push(question);
            numsQuestionsSelectionnees.push(number);
            card.remove();

            // Supprimer l'élément correspondant de resultatsDeRecherche
            const indexToRemove = resultatsDeRecherche.findIndex(q => q.number === number);
            if (indexToRemove !== -1) {
                resultatsDeRecherche.splice(indexToRemove, 1);
            }
            questionsContainer.appendChild(createBoiteQuestion(question.number, question.text));
            majURL();

        });


        items.appendChild(enonce);

        if (questionsSelectionnees.some(q => q.number === number) || questionsSelectionnees.some(q => q.number === parseInt(number))) {
            // Interprétation MathJax
            // setTimeout(()=>{
            MathJax.typesetPromise([enonce])
                .catch(err => console.error(err));
            // }, 300);
            const conteneurBoutons = document.createElement("div");
            conteneurBoutons.style.display = "flex";
            // conteneurBoutons.style.alignItems = "center";

            const boutonMonter = createButton("▲", () => moveQuestion(number, -1, text));
            const boutonDescendre = createButton("▼", () => moveQuestion(number, 1, text));
            const boutonSupprimer = createButton("✖", () => {
                const index = questionsSelectionnees.findIndex(q => q.number === parseInt(number));
                if (index !== -1) {
                    questionsSelectionnees.splice(index, 1);
                    numsQuestionsSelectionnees.splice(index, 1);
                    card.remove();
                    affichageResultatsRecherche();
                }
                majURL();
            });

            conteneurBoutons.appendChild(boutonMonter);
            conteneurBoutons.appendChild(boutonDescendre);
            conteneurBoutons.appendChild(boutonSupprimer);
            items.appendChild(conteneurBoutons);

        } else {
            items.appendChild(boutonAjouter);
        }

        card.appendChild(items);
        return card;
    }

    /**
     * Fonction qui crée un bouton
     * 
     * @param {string} label - Le texte du bouton
     * @param {function} onClick - La fonction à exécuter au clic
     * @returns {HTMLElement} Le bouton
     */
    function createButton(label, onClick) {
        const button = document.createElement("button");
        button.className = "bouton";
        button.textContent = label;
        button.addEventListener("click", onClick);
        button.style.margin = "2px";
        button.style.height = "25px";
        button.style.width = "25px";
        return button;
    }

    /**
     * Fonction qui déplace une question dans la liste des questions sélectionnées
     * 
     * @param {number} number - Le numéro de la question
     * @param {number} offset - Le décalage
     */
    function moveQuestion(number, offset, text) {
        const index = questionsSelectionnees.findIndex(q => q.number === parseInt(number));
        if (index > -1 && index + offset >= 0 && index + offset < questionsSelectionnees.length) {
            const temp = questionsSelectionnees[index];
            questionsSelectionnees[index] = questionsSelectionnees[index + offset];
            questionsSelectionnees[index + offset] = temp;

            const tempNum = numsQuestionsSelectionnees[index];
            numsQuestionsSelectionnees[index] = numsQuestionsSelectionnees[index + offset];
            numsQuestionsSelectionnees[index + offset] = tempNum;

            questionsContainer.innerHTML = "";
            questionsSelectionnees.forEach((question, index) => {
                questionsContainer.appendChild(createBoiteQuestion(question.number, question.text));
            });
        }
        majURL();
    }


    /**
     * Fonction mettant à jour de l'url en fonction des questions sélectionnées
     */
    function majURL() {
        url = "";
        if (numsQuestionsSelectionnees.length > 0) {
            url += "?liste=" + numsQuestionsSelectionnees.join("+");
            window.history.pushState("", "", url);
        }
        if (numsQuestionsSelectionnees.length == 0) {
            url = window.location.origin + window.location.pathname;
            window.history.pushState("", "", url);
        }
    }

    /**
     * Préchargement des questions sélectionnées à partir de l'url
     */
    function prechargerListeQuestionsSelectionnees() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('liste')) { // S'il existe le paramètre "liste" dans l'URL
            const liste = urlParams.get('liste');

            numsQuestionsSelectionnees = liste.split(/,|\+|\s/).map(Number);
            console.log("nums au prechargement 1: " + numsQuestionsSelectionnees);
        }
        if (numsQuestionsSelectionnees.length > 0) {
            for (let i = 0; i < numsQuestionsSelectionnees.length; i++) {
                const question = {
                    number: numsQuestionsSelectionnees[i],
                    text: dataQuestions[numsQuestionsSelectionnees[i]].texte
                };
                questionsSelectionnees.push(question);
                questionsContainer.appendChild(createBoiteQuestion(numsQuestionsSelectionnees[i], question.text))
            }
        }
        console.log("nums au prechargement 2 : " + numsQuestionsSelectionnees);
    }




    /* Début du programme */

    // le mot rechercher dans la barre (input) de recherche
    let motRechercher = document.getElementById('motRechercher');

    // les résultats de la recherche afficher dans la div "resultats de la recherche"
    let resultatsDeRecherche = [];

    // la liste des numéros de questions sélectionnées
    let questionsSelectionnees = [];

    // la div qui contient les "questions trouvées"
    let itemsContainer = document.getElementById('itemsContainer');

    // la div qui contient les "questions sélectionnées"
    let questionsContainer = document.getElementById('questionsContainer');

    // la liste des numéros de questions sélectionnées
    let numsQuestionsSelectionnees = [];

    let url = window.location.href;
    let codeLatexAMC = "";
    let codeLatexMoodle = "";
    var dataQuestions = [];
    var texteQuestions = [];
    fetchData();

    const exporter = ()=>{
        window.open('export.html?liste='+numsQuestionsSelectionnees.join('+'), '_blank');
    }
