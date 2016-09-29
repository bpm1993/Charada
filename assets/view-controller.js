var questions = [];
var rightQuestions = [];
var wrongQuestions = [];
var lockAnwser = false;
var rightOpt;
var system;
var questionsData;
var spec;
var systemId;
var specId;
var questionsAll = [];
var idCount;
var selectedOption;

var config = {
	apiKey: "AIzaSyBrH_L6Id-zG6CyqQlTsiW0R9Uufi3tMiQ",
	authDomain: "charada-1ec1e.firebaseapp.com",
	databaseURL: "https://charada-1ec1e.firebaseio.com",
	storageBucket: "charada-1ec1e.appspot.com",
};
firebase.initializeApp(config);

var questionsFB = firebase.database().ref('questions/');

var hash = document.location.hash.substring(1).split('&');
createBody();

window.addEventListener('hashchange', function() {
    hash = document.location.hash.substring(1).split('&');
    document.body.innerHTML = "";
    createBody();
});

$('body').on('change',' input', function(){
    selectedOption = $(this).parent().text();
    console.log(selectedOption);
})

function createBody(){
    switch (hash[0]) {
        case "menu":
            menuBody();
            break;
        case "questions":
            questionBody();
            break;
        default:
            document.location.hash = "#menu";
            break;
    }
}

function menuBody(){
    switch (hash[1]) {
        case "adobe":
            if(hash[2] == "da"){
                
            } else if(hash[2] == "dev") {

            } else if(hash[2] == "arq"){

            } else {
                menuAdobe();
            }
            break;
        default:
            menuAll();
            break;
    }
}

function menuAll(){
    document.body.innerHTML = document.getElementById('menu').innerHTML;
    menuChangeLabel("Selecione o sistema:")
    menuInsertOption("#menu&adobe", "Adobe");
    menuInsertOption("#menu&ga", "GA");
}

function menuAdobe(){
    document.body.innerHTML = document.getElementById('menu').innerHTML;
    menuChangeLabel("Selecione a sua especialização:")
    menuInsertOption("#questions&adobe&da&start", "DA");
    menuInsertOption("#questions&adobe&dev&start", "Dev");
    menuInsertOption("#questions&adobe&arq&start", "Arquiteto");
}

function menuGA(){

}

function question(){
    if(hash[3] == 'start'){
        questionStart();
    } else if(hash[3] == 'finish') {
        questionFinish();
    } else {
        getQuestion();
    }
}

function resetCharada(){
    document.location.hash = "#menu";
}

function questionFinish(){
    document.body.innerHTML = document.getElementById('questionsFinish').innerHTML;
    questionChangeText("Você acertou " + rightQuestions.length + " de " + questions.length + " questões");
}

function resetArrays(){
    questionsAll = [];
    questions = [];
    rightQuestions = [];
    wrongQuestions = [];
    rightOpt = "";
    selectedOption = "";
}
    
function questionStart(){
    resetArrays();
    system = hash[1];
    spec = hash[2];
    getSystemId();
}

function callbackIdCount(){
    if(idCount > 0){
        getQuestionData(0);
    }
}

function callbackQuestionData(){
    questionsAll[Math.floor(Math.random() * questionsAll.length)];
    if(questionsAll.length > 50){
        for(var count2 = 0; count2 < 50; count2++){
            console.log(count2);
            questions[count2] = questionsAll[count2];
        }
    } else {
        for(var count2 = 0; count2 < idCount; count2++){
            console.log(count2);
            questions[count2] = questionsAll[count2];
        }
    }

    shuffleArray(questions);

    if(!isNaN(parseInt(hash[3]))){
        console.log(isNaN(parseInt(hash[3])));
        document.location.hash = "#questions&" + system + "&" + spec + "&" + parseInt(hash[3]) + 1;
    } else {
        document.location.hash = "#questions&" + system + "&" + spec + "&" + "0";
    }
    
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function getQuestion(){
    var thisQuestion = questions[parseInt(hash[3])];
    var opts = questions[parseInt(hash[3])].opts;
    rightOpt = opts[0];
    document.body.innerHTML = document.getElementById('questions').innerHTML;
    questionChangeText(thisQuestion.question);
    shuffleArray(opts);
    console.log(opts);
    for(var count = 0; count < opts.length; count++){
        questionInsertRadio(opts[count]);
    }
    lockAnwser = false;
}

function confirmAnswer(){
    console.log(selectedOption);
    console.log(rightOpt);
    if(selectedOption == rightOpt){
        rightQuestions.push(questions[parseInt(hash[3])]);
    } else {
        wrongQuestions.push(questions[parseInt(hash[3])]);
    }
    lockAnwser = true;
    if(parseInt(hash[3])+ 1 == idCount ){
        document.location.hash = "#questions&" + system + "&" + spec + "&finish";
    } else {
        document.location.hash = "#questions&" + system + "&" + spec + "&" + parseInt(hash[3]) + 1;
    }
}

function menuChangeLabel(labelText){
    $("#menu-title").html(labelText);
}

function menuInsertOption(hrefText, labelText){
    var listLi = document.createElement("li");
    var listA = document.createElement("a");

    listLi.setAttribute("role", "presentation");
    listLi.className = "active";
    listA.innerHTML = labelText;
    listA.href = hrefText;

    listLi.appendChild(listA);
    $(".nav-stacked").append(listLi);
}

function questionBody(){
    question();
}

function questionInsertRadio(labelText){
    var newOption = document.createElement("div");
    var newLabel = document.createElement("label");
    var newInput = document.createElement("input");

    newInput.setAttribute("type", "radio");
    newInput.setAttribute("name", "optradio");

    newLabel.innerHTML = labelText;

    newLabel.appendChild(newInput);
    newOption.appendChild(newLabel);
    $(".questionOptions").append(newOption);
}

function questionChangeText(newText){
    $(".questionLabel").html(newText);
}

function getIdCount(){
    var id;
    questionsFB.on("value", function(spec) {
        idCount = spec.child('idCount').val();
        callbackIdCount();
	});
}

function getQuestionData(countNumber){
    countNumber++;
    questionsFB = firebase.database().ref('questions/' + system + '/' + spec + '/questions/');
    questionsFB.on("value", function(systems) {
        systems.forEach(function(questions) {
            if(countNumber <= idCount){
                if(countNumber > 10){
                    console.log(systemId + specId + String(countNumber));
                    questionsAll[countNumber - 1] = systems.child(systemId + specId + String(countNumber)).val();
                } else {
                    console.log(systemId + specId + "0" + String(countNumber));
                    questionsAll[countNumber - 1] = systems.child(systemId + specId + "0" + String(countNumber)).val();
                }
                console.log(countNumber);
                console.log(systems.val());
                countNumber++;
                if(countNumber >= idCount){
                    callbackQuestionData();
                } else {
                    getQuestionData(countNumber);
                }
            }
        });
	});
}

function getSystemId(){
    questionsFB = firebase.database().ref('questions/' + system);
    questionsFB.on("value", function(spec) {
        systemId = spec.child('idPref').val();
        getSpecId();
	});
}

function getSpecId(){
    questionsFB = firebase.database().ref('questions/' + system + '/' + spec + '/');
    questionsFB.on("value", function(spec) {
        specId = spec.child('idPref').val();
        getIdCount();
	});
}