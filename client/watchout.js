// start slingin' some d3 here.

var gameOptions = {
  height: 450,
  width: 700,
  nEnemies: 30,
  padding: 20
}
var gameStats = {
  currentScore: 0,
  highScore: 0
}

var axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameOptions.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameOptions.height])
}

var gameBoard = d3.select('.board').append('svg:svg')
                  .attr('width', gameOptions.width)
                  .attr('height', gameOptions.height)
                  .attr('class', 'gameBoard');


function updateScore() {
  d3.select('.current')
    .text(gameStats.currentScore.toString());
}

function increaseScore() {
  gameStats.currentScore += 1;
  updateScore();
}

function updateHighScore() {
  gameStats.highScore = Math.max(gameStats.highScore, gameStats.currentScore);
  d3.select('.highscore').text(gameStats.highScore.toString());
}


// enemy code
function createEnemies() {
  var enemies = [];
  for (var i = 0; i < gameOptions.nEnemies; i++) {
    enemies.push({id:i,
                  x: Math.random()*100,
                  y: Math.random()*100
                 });
  }
  return enemies;
}

function render(enemyData) {
  var enemies = gameBoard.selectAll("circle.enemy")
                .data(enemyData, function(d){return d.id});
  enemies.enter().append('svg:circle')
         .attr('class', 'enemy')
         .attr('cx', function(enemy){return axes.x(enemy.x)})
         .attr('cy', function(enemy){return axes.y(enemy.y)})
         .attr('r', 0); 

  enemies.exit().remove();

  // collision logic

  // function checkCollision(enemy, collidedCallback) {

  // }


  // render enemies on screen
  enemies
    .transition()
      .duration(500)
      .attr('r', 10)
    .transition()
      .duration(2000)
      .tween('custom', tweenWithCollisionDetection);
}


function play() {
  function gameTurn() {
    newEnemyPositions = createEnemies();
    render(newEnemyPositions);

  }

  gameTurn();
  setInterval(gameTurn, 2000);
  setInterval(function() { increaseScore(); }, 50);

}


play();