var questions = [];
var rightQuestions = [];
var wrongQuestions = [];
var menuSysAll = [];
var menuSpecAll = [];
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
    menuSysAll = [];
    menuSpecAll = [];
    createBody();
});

$('body').on('change',' input', function(){
    selectedOption = $(this).parent().text();
})

function createBody(){
    switch (hash[0]) {
        case "menu":
            loadMenuOptions();
            break;
        case "questions":
            question();
            break;
        default:
            document.location.hash = "#menu";
            break;
    }
}

function loadMenuOptions(){
    if(hash[1] != undefined){
        questionsFB = firebase.database().ref('questions/' + hash[1]);
        questionsFB.on("value", function(all) {
            all.forEach(function(spec){
                if(typeof spec.val() == "object"){
                    menuSpecAll.push(spec.key);
                }
            })
            menuSpec();
        });
    } else {
        questionsFB = firebase.database().ref('questions/');
        questionsFB.on("value", function(all) {
            all.forEach(function(systems){
                if(typeof systems.val() == "object"){
                    menuSysAll.push(systems.key);
                }
            })
            menuAll();
        });
    }
    
}

function menuAll(){
    document.body.innerHTML = document.getElementById('menu').innerHTML;
    menuChangeLabel("Selecione o sistema:")
    for(var count = 0; count < menuSysAll.length; count++){
        menuInsertOption('#menu&' + menuSysAll[count], menuSysAll[count]);
    }
}

function menuSpec(){
    document.body.innerHTML = document.getElementById('menu').innerHTML;
    menuChangeLabel("Selecione a especialidade:");
    for(var count = 0; count < menuSpecAll.length; count++){
        menuInsertOption('#questions&' + hash[1] + '&' + menuSpecAll[count] + '&start', menuSpecAll[count]);
    }
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
            questions[count2] = questionsAll[count2];
        }
    } else {
        for(var count2 = 0; count2 < idCount; count2++){
            questions[count2] = questionsAll[count2];
        }
    }

    console.log(questions);

    shuffleArray(questions);

    if(!isNaN(parseInt(hash[3]))){
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

    if(thisQuestion.type == "single"){
        for(var count = 0; count < opts.length; count++){
            questionInsertRadio(opts[count]);
        }
    } else {
        for(var count = 0; count < opts.length; count++){
            questionInsertCheck(opts[count]);
        }
    }

    
    lockAnwser = false;
}

function confirmAnswer(){
    if(questions[parseInt(hash[3])].type == 'single'){
        if(selectedOption == rightOpt){
            rightQuestions.push(questions[parseInt(hash[3])]);
        } else {
            wrongQuestions.push(questions[parseInt(hash[3])]);
        }
    } else {
        var totalRight = 0;
        for(var count = 0; count < $(':checked').length; count++){
            for(var count2 = 0; count2 < questions[parseInt(hash[3])].rightAnswers; count2++){
                if($($(':checked')[count]).parent().text() == questions[parseInt(hash[3])].opts[count2]){
                    totalRight++;
                }
            }
        }

        if(totalRight == questions[parseInt(hash[3])].rightAnswers){
            rightQuestions.push(questions[parseInt(hash[3])]);
        } else {
            wrongQuestions.push(questions[parseInt(hash[3])]);
        }
    }
    
    lockAnwser = true;
    if(parseInt(hash[3])+ 1 == idCount ){
        document.location.hash = "#questions&" + system + "&" + spec + "&finish";
    } else {
        var newFrag = String(parseInt(hash[3]) + 1)
        if(parseInt(hash[3]) + 1 < 10){
            newFrag = String("0" + (parseInt(hash[3]) + 1));
        } else {
            newFrag = String((parseInt(hash[3]) + 1));
        }
        document.location.hash = "#questions&" + system + "&" + spec + "&" + newFrag;
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

    newLabel.appendChild(newInput);
    newLabel.innerHTML += labelText;

    newOption.appendChild(newLabel);
    $(".questionOptions").append(newOption);
}

function questionInsertCheck(labelText){
    var newOption = document.createElement("div");
    var newLabel = document.createElement("label");
    var newInput = document.createElement("input");

    newInput.setAttribute("type", "checkbox");
    newInput.setAttribute("value", "");

    newLabel.appendChild(newInput);
    newLabel.innerHTML += labelText;

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
        idCount--;
        callbackIdCount();
    });
}

function getQuestionData(countNumber){
    countNumber++;
    questionsFB = firebase.database().ref('questions/' + system + '/' + spec + '/questions/');
    questionsFB.on("value", function(systems) {
        var count = 0;
        systems.forEach(function(questions) {
            questionsAll[count] = questions.val();
            count++;
        });
        callbackQuestionData();
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
