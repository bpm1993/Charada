var multipleCorrects = false;
var countCorrects = 1;
var count = 1;
var idSystem;
var idSpec;
var idCount;

var config = {
	apiKey: "AIzaSyBrH_L6Id-zG6CyqQlTsiW0R9Uufi3tMiQ",
	authDomain: "charada-1ec1e.firebaseapp.com",
	databaseURL: "https://charada-1ec1e.firebaseio.com",
	storageBucket: "charada-1ec1e.appspot.com",
};
firebase.initializeApp(config);

$("#numberOfCorrectsSpace").on('change', 'input', function(){
    console.log("asdas");
    if(parseInt($(this).val()) > 1)
    countCorrects = parseInt($(this).val());
})

$("#questionType input").on('change', function(){
    console.log($(this).parent().text());
    if($(this).parent().text() == "Multiplas Respostas"){
        multipleCorrects = true;

        var input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("class", "form-control");
        input.setAttribute("id", "numCorrects");

        var label = document.createElement("label");
        label.innerHTML = "Numero de Corretas:";

        var div = document.createElement("div");
        input.setAttribute("class", "form-control");
        input.setAttribute("id", "numberOfCorrects");

        div.appendChild(label);
        div.appendChild(input);

        var br = document.createElement("br");

        $('#numberOfCorrectsSpace').append(div);
        $('#numberOfCorrectsSpace').append(br);
    } else if(multipleCorrects) {
        multipleCorrects = false;
        $('#numberOfCorrects').html = "";
    }
})

function insertQuestion(){
	var inputDiv = document.createElement('div');
	var inputLabel = document.createElement('LABEL');
	var input = document.createElement('Input');
	inputDiv.className = 'form-group';
	inputDiv.id = 'form' + count;
	inputLabel.innerHTML = 'Opção ' + (count + 1) + ':';
	input.type ="text";
	input.className ="form-control";
	input.id ="pageSel" + count;
	input.placeholder="Insira o seletor";
	
	inputDiv.appendChild(inputLabel);
	inputDiv.appendChild(input);
	document.getElementById("InputForm").appendChild(inputDiv);
	
	count++;
}

function submitData(){
    sendData();
    
    $('#name').val('');
    $('#pageName').val('');
    $('#pageURL').val('');
    
    count = 1;
}

function sendData() {
    var options = [];
    var systemName;
    var specName;
    var question;
    var type;
    var rightAnswers;

    systemName = document.getElementById("system").value;
    specName = document.getElementById("spec").value;
    question = document.getElementById("question").value;

    if(multipleCorrects){
        type = 'multiple';
        rightAnswers = document.getElementById('numberOfCorrects').value;
    } else {
        type = 'single';
        rightAnswers = 1;
    }

    for(var count2 = 0; count2 < count; count2++){
        options[count2] = document.getElementById("pageSel" + count2).value;
    }

    firebase.database().ref('questions/').transaction(function (post) {
        if(post){
            if(post[systemName] != null){
                var systems =  post[systemName];
                if(post[systemName][specName] != null){
                    var specs = systems[specName];
                    var questions = specs.questions;
                    var questionId;
                    if(specs.idCount >= 10){
                        questionId = systems.idPref + specs.idPref + String(specs.idCount);
                    } else {
                        questionId = systems.idPref + specs.idPref + "0" + String(specs.idCount);
                    }
                    
                    questions[questionId] = {
                        "difLevel" : 0,
                        "numVotes" : 0,
                        "qualLevel" : 0,
                        "question" : question,
                        "rightAnswers" : rightAnswers,
                        "type" : type,
                        "opts" : options
                    }
                    specs.idCount = specs.idCount + 1;
                } else {
                    var newID;
                    var questionID;
            
                    if(systems.idCount >= 10){
                        newID = String(systems.idCount);
                    } else {
                        newID = "0" + String(systems.idCount);
                    }

                    questionID = systems.idPref + newID + "01";

                    post[systemName][specName] = {
                        "idCount" : 2,
                        "idPref" : String(newID),
                        "questions": {}
                    }

                    post[systemName][specName].questions[questionID] = {
                        "difLevel" : 0,
                        "numVotes" : 0,
                        "qualLevel" : 0,
                        "question" : question,
                        "rightAnswers" : rightAnswers,
                        "type" : type,
                        "opts" : options
                    }
                   
                    systems.idCount = systems.idCount + 1;
                }
            } else {
                console.log('asdsadas');
                var newSysID;
                var newSpecID = "01";
                var questionID;

                if (post.idCount >= 10) {
                    newSysID = String(post.idCount);
                } else {
                    newSysID = "0" + String(post.idCount);
                }

                questionID = newSysID + newSpecID + "01";

                post[systemName] = {
                    idPref: newSysID,
                    idCount: 1
                };

                post[systemName][specName] = {
                    "idCount": 2,
                    "idPref": newSysID,
                    "questions": {}
                }

                post[systemName][specName].questions[questionID] = {
                    "difLevel" : 0,
                    "numVotes" : 0,
                    "qualLevel" : 0,
                    "question" : question,
                    "rightAnswers" : rightAnswers,
                    "type" : type,
                    "opts" : options
                }

                post.idCount = post.idCount + 1;
            }
        }
        return post;
    });
}