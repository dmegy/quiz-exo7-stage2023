/**
 * Retourne les numéros des questions dans le paramètre 'liste'
 * 
 * @returns {array} - Une liste d'entiers contenant les numéros
 */
const getNumsQuestions = () => {
    var numsQuestionsSelectionnees = [];
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('liste')) {
        const liste = urlParams.get('liste');

        // séparateurs valides dans le paramètre liste : ',' et '+' 
        numsQuestionsSelectionnees = liste.split(/,|\+|\s/).map(Number);
    }
    return numsQuestionsSelectionnees;
}

/**
 * Retourne une question du catalogue à partir de son numéro
 * 
 * @param {integer} - Numéro de la question 
 * @returns {object} - L'objet "question"
 */
async function getQuestion(numQuestion) {
    await fetch('https://raw.githubusercontent.com/Phil1010/quiz-exo7-stage2023/main/catalogue.json')
        .then(response => response.json())
        .then(data => {
            question = data[numQuestion];
            return question;
        })
        .catch(error => console.error(error));

    return question;
};

/**
 * Retourne le code AMC de toutes les questions
 * 
 * @returns {string} - le code AMC complet
 */
const getCodeAMC = async () => {

    var texteFinal = '';
    // Pour chaque question, on prend son code source LaTeX, on y ajoute les éléments AMC, et on concatène toutes les questions
    for (i = 0; i < numsQuestionsSelectionnees.length; i++) {
        var question = await getQuestion(numsQuestionsSelectionnees[i])
        var codeQuestion = question.texte;

        // Si la réponse "Vrai" est la bonne réponse
        if (question.reponses[0].correct) {
            var stringVrai = '\\bonne{Vrai}';
            var stringFaux = '\\mauvaise{Faux}';
        }
        else {
            var stringVrai = '\\mauvaise{Vrai}';
            var stringFaux = '\\bonne{Faux}';
        }
        texteFinal += codeQuestion + '\n\n\\begin{responses}\n' + stringVrai + '\n' + stringFaux + '\n\\end{reponses}\n\n\n';
    }
    return texteFinal;
}

/**
 * Retourne le code LaTeX Moodle de toutes les questions
 * 
 * @returns {string} - le code LaTeX Moodle complet
 */
const getCodeMoodle = async () => {
    var texteFinal = '';
    // Pour chaque question, on prend son code source LaTeX, on y ajoute les éléments AMC, et on concatène toutes les questions
    for (i = 0; i < numsQuestionsSelectionnees.length; i++) {
        var question = await getQuestion(numsQuestionsSelectionnees[i])
        var codeQuestion = question.texte;

        // Si la réponse "Vrai" est la bonne réponse
        if (question.reponses[0].correct) {
            var stringVrai = '\\item* Vrai';
            var stringFaux = '\\item Faux';
        }
        else {
            var stringVrai = '\\item Vrai';
            var stringFaux = '\\item* Faux';
        }
        texteFinal += '\\begin{truefalse}{q-' + numsQuestionsSelectionnees[i] + '}\n' + codeQuestion + '\n' + stringVrai + '\n' + stringFaux + '\n\\end{truefalse}\n\n\n';
    }
    return texteFinal;
}

/**
 * Affiche dans un nouvel onglet le code AMC de toutes les questions
 */
const ouvrirCodeAMC = async () => {
    var codeAMC = await getCodeAMC();
    var newTab = window.open('', '_blank');
    newTab.document.write('<html><body><pre>' + codeAMC + '</pre></body></html');
    newTab.document.close();
}

/**
 * Affiche dans un nouvel onglet le code LaTeX Moodle de toutes les questions
 */
async function ouvrirCodeMoodle() {
    var codeMoodle = await getCodeMoodle();
    var newTab = window.open('', '_blank');
    newTab.document.write('<html><body><pre>' + codeMoodle + '</pre></body></html');
    newTab.document.close();
}

/**
 * Sauvegarde sur le disque dur un fichier .txt contenant le code AMC 
 */
async function sauvegarderCodeAMC() {
    const codeLatexAMC = await getCodeAMC();
    const fileName = "quiz-AMC-" + numsQuestionsSelectionnees + ".txt";

    // Objet Blob avec le code AMC comme contenu
    const blob = new Blob([codeLatexAMC], { type: "text/plain" });

    // URL temporaire à partir du blob
    const url = URL.createObjectURL(blob);

    // Création du lien
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    // Clic du lien
    link.click();

    // Nettoyage de l'URL temporaire
    URL.revokeObjectURL(url);
}

/**
 * Sauvegarde sur le disque dur un fichier .txt contenant le code LaTeX Moodle
 */
async function sauvegarderCodeLatexMoodle() {
    const codeLatexMoodle = await getCodeMoodle();
    const fileName = "quiz-Moodle-" + numsQuestionsSelectionnees + ".txt";

    // Objet Blob avec le code Moodle comme contenu
    const blob = new Blob([codeLatexMoodle], { type: "text/plain" });

    // URL temporaire à partir du blob
    const url = URL.createObjectURL(blob);

    // Création du lien
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    // Clic du lien
    link.click();

    // Nettoyage de l'URL temporaire
    URL.revokeObjectURL(url);
}

/**
 * Ouvre le code AMC dans Overleaf
 */
async function ouvrirOverleafAMC() {
    try {
        // Récupérer le contenu du fichier texte
        const fichierPreambule = await fetch(
            "https://raw.githubusercontent.com/dmegy/exercices-exo7-stage2023/main/exercices/_preambule.txt"
        );
        let preambule = (await fichierPreambule.text());

        // Concaténer le contenu du fichier avec le code Latex AMC
        let concatenatedText = preambule + (await getCodeAMC());
        concatenatedText += "\n" + "\\end{document}";

        // Mettre le contenu dans le textarea du formulaire
        const textarea = document.querySelector('textarea[name="snip"]');
        if (textarea) {
            textarea.value = concatenatedText;
        }
    }
    catch (error) {
        console.error(error);
    }
}


/**
 * Ouvre le code LaTeX Moodle dans Overleaf
 */
async function ouvrirOverleafMoodle() {
    try {

        // Récupérer le contenu du fichier texte
        const fichierPreambule = await fetch(
            "https://raw.githubusercontent.com/dmegy/exercices-exo7-stage2023/main/exercices/_preambule.txt"
        );
        let preambule = (await fichierPreambule.text());

        // Concaténer le contenu du fichier avec le code Latex AMC
        let concatenatedText = preambule + (await getCodeMoodle());
        concatenatedText += "\n" + "\\end{document}";

        // Mettre le contenu dans le textarea du formulaire
        const textarea = document.querySelector('textarea[name="snip"]');
        if (textarea) {
            textarea.value = concatenatedText;
        }
    }
    catch (error) {
        console.error(error);
    }
}

/**
 * Partage le lien par mail
 */
function partagerMail() {
    // Subject de l'email
    let subject = "QUIZ";
    // Corps de l'email
    let body = "Voici un quiz personnalisé. Il contient les exercices " + numsQuestionsSelectionnees + ".\n\nVous pouvez également accéder au quiz en scannant ce QR Code\n\n" + petitQRCode.createImgTag();
    let mailtoLink = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body); // URL mailto

    window.location.href = mailtoLink; // Ouvre le client mail de l'utilisateur avec le nouvel email pré-rempli
}

/**
 * Ouvre le QR Code du quiz dans un nouvel onglet
 */
function ouvrirQRCode() {
    var urlQuiz = makeURLQuiz();
    var qr = new QRCode(document.createElement("div"), {
        text: urlQuiz,
        width: 128,
        height: 128
    });

    var qrDataUrl = qr._el.firstChild.toDataURL();
    var newTab = window.open("", "_blank");
    newTab.document.write('<html><body><img src="' + qrDataUrl + '"></body></html>');
    newTab.document.close();
}

/**
 * Copie le lien actuel dans le presse-papier
 */
function copierLien() {
    var dummyTextArea = document.createElement('textarea');
    dummyTextArea.value = window.location.href;
    document.body.appendChild(dummyTextArea);
    dummyTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(dummyTextArea);
}

/**
 * Fonction qui génère un ID pour le quiz.
 * Première partie de l'ID prend en compte le temps actuel (Epoch Time) convertit en String base 36.
 * Deuxième partie de l'ID générée à partir d'un nombre décimal aléatoire compris entre 0 et 1, convertit en String base 36.
 * 
 * @returns {string} - L'identifiant
 */
function creerID() {
    const timestamp = Date.now().toString(36);
    const randomChars = Math.random().toString(36);
    return (timestamp + randomChars).substring(0, 15);
}

// Version différente pour la creation d'ID
/*function creerID() {
    let result = '';

    for (let i = 0; i < 15; i++) {
        const randomCharCode = Math.floor(Math.random() * 62);
        const char = String.fromCharCode(randomCharCode + (randomCharCode < 26 ? 97 : randomCharCode < 52 ? 39 : -4));
        result += char;
    }

    return result;
}*/


// Radio button "Non" sélectionné par défaut. Fait côté javascript pour esquiver le cache du navigateur
// (Si c'était fait côté html, il faudrait hard refresh pour que le "checked" prenne effet)
window.addEventListener('DOMContentLoaded', function () {
    document.getElementById('random-non').checked = true;
});

var numsQuestionsSelectionnees = getNumsQuestions();


/**
 * Vérifie la validité de la pénalité rentrée dans l'input
 * @param {string} input - Ce qui est entré dans l'input 
 * @returns {boolean} - Vrai si la pénalité est valide (entre 0 et 1), Faux sinon
 */
function isValidPenalite(input) {
    const number = parseFloat(input);
    return !isNaN(number) && number >= 0 && number <= 1;
}

/**
 * Construit l'url du Quiz avec les paramètres
 * @returns {string} - L'url
 */
function makeURLQuiz() {
    var penalite = document.getElementById('input-penalite').value;
    if (!isValidPenalite(penalite)) {
        console.log('Penalite Invalide');
        return '';
    }
    var nickname = document.getElementById('input-nickname').value;
    var randomiser = document.getElementById('random-oui').checked;
    var identifiant = creerID();
    var urlQuiz = 'https://phil1010.github.io/quizapp-exo7/?c=' + numsQuestionsSelectionnees.join('+') +
        '&r=' + Number(randomiser) + '&p=' + penalite + '&n=' + nickname + '&i=' + identifiant;
    return urlQuiz;
}

/**
 * Ouvrir le quiz dans un nouvel onglet
 */
function ouvrirQuiz() {
    const urlQuiz = makeURLQuiz();
    var newTab = window.open(urlQuiz, '_blank');
    if (!urlQuiz) {
        newTab.document.write('<html><body><p> Pénalité invalide. Il faut entrer une pénalité entre 0 et 1 </p></body></html');
    }
    newTab.document.close();
}