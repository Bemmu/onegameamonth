var svg = d3.select("svg");
var width = $("svg").width();
var height = $("svg").height();
var ballXS = width/2;
var ballYS = 0;
var ballX = null;
var ballHeight = 10;
var ballWidth = 10;
var ballY = null;
var maxAngle = height/2;
var lastTime = null;
var leftPaddleX = 50;
var leftPaddleY = 10;
var leftPaddleHeight = 100;
var leftPaddleWidth = 10;
var rightPaddleX = width - 50;
var rightPaddleY = 20;
var rightPaddleHeight = 100;
var rightPaddleWidth = 10;
var leftScore = 0;
var rightScore = 0;

function resetBall() {
	ballY = height/2 - ballHeight/2;
	ballX = width/2 - ballWidth/2;
}

function tr(x, y) {
	return "translate(" + x + ", " + y + ")";
}

function updateBall(x, y) {
	var ball = svg.selectAll("#ball");
	ball.attr("transform", tr(x, y));
}

function boxesIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
	return (
		Math.min(x1 + w1, x2 + w2) >= Math.max(x1, x2) && 
		Math.min(y1 + h1, y2 + h2) >= Math.max(y1, y2)
	);
}

function ballPaddleCollisions() {
	var ballCenterY = ballY + ballHeight/2;
	var leftPaddleCenterY = leftPaddleY + leftPaddleHeight/2;
	var rightPaddleCenterY = rightPaddleY + rightPaddleHeight/2;

	if (boxesIntersect(ballX, ballY, ballWidth, ballHeight, leftPaddleX, leftPaddleY, leftPaddleWidth, leftPaddleHeight)) {
		if (ballXS < 0) {
			ballXS = -ballXS;
		}
		ballYS = ((ballCenterY - leftPaddleCenterY)/(leftPaddleHeight/2)) * maxAngle;
	}
	if (boxesIntersect(ballX, ballY, ballWidth, ballHeight, rightPaddleX, rightPaddleY, rightPaddleWidth, rightPaddleHeight)) {
		if (ballXS > 0) {
			ballXS = -ballXS;
		}
		ballYS = ((ballCenterY - rightPaddleCenterY)/(leftPaddleHeight/2)) * maxAngle;
	}
}

function ballWallCollisions() {
	if (ballX < 0) {
		resetBall();
		rightScore++;
		ballXS *= -1;
	}
	if (ballY < 0) {
		ballY = 0;
		ballYS *= -1;
	}
	if (ballX > width - ballWidth) {
		resetBall();
		leftScore++;
		ballXS *= -1;
	}
	if (ballY > height - ballHeight) {
		ballY = height - ballHeight;
		ballYS *= -1;
	}
}

function physics(delta) {
	ballX += ballXS * delta;
	ballY += ballYS * delta;
	ballPaddleCollisions();
	ballWallCollisions();
}

function updatePaddles() {
	var paddles = svg.selectAll(".paddle");
	paddles.attr("width", 10).attr("height", 100).attr("fill", "white");
	svg.select("#leftPaddle").attr("transform", tr(leftPaddleX, leftPaddleY));
	svg.select("#rightPaddle").attr("transform", tr(rightPaddleX, rightPaddleY));
}

function draw() {
	updatePaddles();
	updateBall(ballX, ballY);
	updateScore(leftScore, "#leftScore");
	updateScore(rightScore, "#rightScore");
}

function ai() {
	rightPaddleY = ballY - rightPaddleHeight/2;
}

function gameLoop() {
	var currentTime = (new Date()).getTime();
	delta = (currentTime - lastTime) / 1000;
	lastTime = currentTime;
	physics(delta);
	ai();
	draw();
	window.requestAnimationFrame(gameLoop);
}

function updateScore(points, id) {
	var container = svg.selectAll(id);
	container.selectAll("rect").remove();
	for (var y = 0; y < font[points].length; y++) {
		for (var x = 0; x < font[points][y].length; x++) {
			var bit = font[points][y][x];
			container.append("rect")
			    .attr("width", 7)
			    .attr("height", 10)
			    .attr("transform", tr(x * 7, y * 10))
			    .attr("fill", bit?"white":"black");
		}
	}
}

function blackStripes() {
	var container = svg.selectAll("#blackStripes");
	for (var y = 0; y < height; y += 2) {
		container.append("rect")
		    .attr("width", width)
		    .attr("height", 1)
		    .attr("transform", tr(0, y))
		    .attr("fill", "black");
	}
}

$(function () {
	resetBall();
	lastTime = (new Date()).getTime();
	updateBall(100, 100);
	gameLoop();
	$("svg").bind("mousemove", function (event) {
		leftPaddleY = event.offsetY - leftPaddleHeight/2;
	});
	blackStripes();
});

