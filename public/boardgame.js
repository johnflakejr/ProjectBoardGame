var scores = [1,1,1,1];
var players = 1;
var whosTurn = 1;
var cardScore;


/*
	When the page loads, this message will display
*/
window.onload = function myFunc(){
	document.getElementById('content').innerHTML=`<h1> Welcome to the Game!</h1>
		<div id="rules">
		<ol style="text-align:left">
			<li>You start on space #1.  The goal is to reach space #25.</li>
			<li>You control the game. </li>
			<li>Every turn, you draw a card.</li>
			<li>The card tells you what to do.</li>
			<li>You do it.</li>
			<li>You adjust the player spaces.</li>
			<li>USERS submit the cards. </li>
			<li>Upvote cards you like.</li>
			<li>Downvote cards you hate.</li>
			<li>Have fun!</li>
		</ol>
		<br>
		<button onclick="gameplay()">Continue</button>
		</div>
	`;
};

function getCardAjax(getCardCallBack){
	$.ajax({url: "/card", success: function(cardData){
		getCardCallBack(cardData);
	}});
};
function updateCardScoreAjax(cardID,score,updateScoreCallBack){
	var idObj = {"cardID":cardID};
	if(score == 1){
		$.ajax({
			url: "/upvote", 
			type: "post",
			data: "cardID="+cardID,
			success: function(cardData){
			updateScoreCallBack(cardData);
		}});
	}else if (score == -1){
		$.ajax({
			url: "/downvote", 
			type: "post",
			data: "cardID="+cardID,
			success: function(cardData){
			updateScoreCallBack(cardData);
		}});
	}
};

function drawCard(){
	var score = parseInt(document.getElementById("card-upvote-score").innerHTML);
	var id = parseInt(document.getElementById("card-id").innerHTML);
	document.getElementById('whos-card').innerHTML="Card for Player: " + whosTurn;
	whosTurn++;
	if(whosTurn == 5)
		whosTurn = 1;
	document.getElementById('draw-button').innerHTML="Draw Card for Player " + whosTurn;
	getCardAjax(function(output){
		console.log(output);
		console.log(output.scenario);
		$("#card-scenario").html("<pre>" + output.scenario + "</pre>");
		$("#card-title").html("<pre>" + output.title + "</pre>");
		$("#card-score").html(output.score); 
		$("#card-id").html(output.id);
		cardScore = output.score;
	});
	updateCardScoreAjax(id,score,function(output){
		console.log(output);
	});
	document.getElementById('card-upvote-score').innerHTML=0;
};


function gameplay(){
	/*
	Setup board
	*/
	document.getElementById('content').innerHTML=`
		<div id="center-content">
			<!--<div id="center-header"><h1>ENJOY!</h1></div>-->
			<div id="card-data">
				<p id="whos-card"></p>
				<p id="card-title">Draw a card to begin!</p>
				<p id="card-scenario"></p>
			</div>
			<div id="card-voting">
				<div onclick="upvote()" id="card-upvote"></div>
				<div id="card-score"></div>
				<div onclick="downvote()" id="card-downvote"></div>
				<div id="card-id"></div>
				<div id="card-upvote-score">0</div>
			</div>

			<div id="player-scoring"></div>
			<div id="center-footer"><button id="draw-button" onclick="drawCard()">Draw Card for Player 1</button></div>
		</div>
	`;
	for(i = 1; i <= 4; i++){
		document.getElementById("player-scoring").innerHTML += `
			<div class="player-scorecard">
			<p>Player ` + i + `</p>
			<div onclick="forward(` + i + `)"class="player-forward" id="player-` + i + `-forward">Forward</div>
			<div onclick="back(` + i + `)"class="player-backward" id="player-` + i + `-backward">Back</div>
			</div>
		`;

	}
	//Setup the board based on the location of each player. 
	document.getElementById('board').innerHTML=`
		<div id="top-board-row">
		</div>
		<div id="left-board-col">
		</div>
		<div id="right-board-col">
		</div>
		<div id="bottom-board-row">
		</div>
	`;
	
	for(i = 1; i <= 4; i++){
		document.getElementById('top-board-row').innerHTML += `
			<div class="space" id ="space-no-` + i + `"></div>
		`;
	}
	for(i = 5; i <= 8; i++){
		document.getElementById('right-board-col').innerHTML += `
			<div class="space" id ="space-no-` + i + `"></div>
		`;
	}
	for(i = 11; i > 8; i--){
		document.getElementById('bottom-board-row').innerHTML += `
			<div class="space" id ="space-no-` + i + `"></div>
		`;
	}
	for(i = 14; i > 11; i--){
		document.getElementById('left-board-col').innerHTML += `
			<div class="space" id ="space-no-` + i + `"></div>
		`;
	}
	updateBoard();
};



function clearBoard(){
	for(i = 1; i <= 14; i++){
		document.getElementById("space-no-" + i).innerHTML ="";
	}
};



//Go through the scores and put the correct players in the correct place
function updateBoard(){
	for(i = 0; i < 4; i++){
		document.getElementById("space-no-" + scores[i]).innerHTML += i+1 + "<br>";
	}
};



function forward(player){
	//var score = parseInt(document.getElementById("player-" + player + "-score").innerHTML);
	var score = scores[player-1];
	score = score+1;
	scores[player-1] = score; 
	if(score == 14){
		document.getElementById('content').innerHTML =`<h1>Player ` + player + ` Won!</h1>`;
	}
	clearBoard();
	updateBoard();
};


function back(player){
	//var score = parseInt(document.getElementById("player-" + player + "-score").innerHTML);
	var score = scores[player-1];
	score = score-1;
	if(score <= 1){
		score = 1;
	}
	scores[player-1] = score; 
	clearBoard();
	updateBoard();
};



function upvote(){
	var score = parseInt(document.getElementById("card-upvote-score").innerHTML);
	if(score == 1)
		score = 1
	if(score == 0)
		score = 1;
	if(score == -1)
		score = 0;
	document.getElementById("card-upvote-score").innerHTML = score;
	document.getElementById("card-score").innerHTML = cardScore + score;
}

function downvote(cardID){
	var score = parseInt(document.getElementById("card-upvote-score").innerHTML);
	if(score == -1)
		score = -1;
	if(score == 0)
		score = -1;
	if(score == 1)
		score = 0
	document.getElementById("card-upvote-score").innerHTML = score;
	document.getElementById("card-score").innerHTML = cardScore + score;
}
