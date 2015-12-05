// start slingin' some d3 here.

var gameOptions = {
  height: 450,
  width: 700,
  nEnemies: 30,
  padding: 20
}
var gameStats = {
  currentScore: 0,
  highScore: 0,
  collisionCount:0
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

function updateCollisions(){
  d3.select('.collisions').text(gameStats.collisionCount.toString())
}


// Player Code

var player = {
  //path: 'm-7.5,1.62413c0,-5.04095 4.08318,-9.12413 9.12414,-9.12413c5.04096,0 9.70345,5.53145 11.87586,9.12413c-2.02759,2.72372 -6.8349,9.12415 -11.87586,9.12415c-5.04096,0 -9.12414,-4.08318 -9.12414,-9.12415z',
  
  fill: '#ff6600',
  x: 0,
  y: 0, 
//   this.angle = 0;
  r: 5,
  el: undefined
};

function renderPlayer(){
  player.el = gameBoard.append('svg:circle')
                  .attr('cx', player.x)
                  .attr('fill', player.fill)
                  .attr('cy', player.y)
                  .attr('r', player.r);

}

function moveRelative(dx, dy) {
  player.x += dx;
  player.y += dy;

  var minX = gameOptions.padding;
  var maxX = gameOptions.width - gameOptions.padding;
  player.x = (player.x >= minX) ? player.x : minX;
  player.x = (player.x <= maxX) ? player.x : maxX;

  var minY = gameOptions.padding;
  var maxY = gameOptions.height - gameOptions.padding;
  player.y = (player.y >= minY) ? player.y : minY;
  player.y = (player.y <= maxY) ? player.y : maxY;
  console.log(player.x, player.y)
  player.el.attr('transform', "translate(" + player.x + "," + player.y + ")");
}

function setupDragging() {

  var dragMove = function() {
    moveRelative(d3.event.dx, d3.event.dy);
  }

  var dragBehavior = d3.behavior.drag().on('drag', dragMove);
  player.el.call(dragBehavior);
}


renderPlayer();
moveRelative(350, 225); // d3 magic
setupDragging(); // on player

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

  function checkCollision(enemy) {  
    var radiusSum = parseFloat(enemy.attr('r')) + player.r;
    var xDiff = parseFloat(enemy.attr('cx')) - player.x;
    var yDiff = parseFloat(enemy.attr('cy')) - player.y;

    var seperation = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
    if (seperation < radiusSum) onCollision();
    
  }

  function onCollision(){
    updateHighScore();
    gameStats.currentScore = 0;
    updateScore();
    gameStats.collisionCount++;
    updateCollisions();
  }

  function tweenWithCollisionDetection(endData) {
    var enemy = d3.select(this);

    var startPos = {x: parseFloat(enemy.attr('cx')),
                    y: parseFloat(enemy.attr('cy'))
                   };

    var endPos = {x: axes.x(endData.x), y: axes.y(endData.y)};


    return function(t) {
      checkCollision(enemy);
      var enemyNextPos = {x: startPos.x + (endPos.x - startPos.x)*t,
                          y: startPos.y + (endPos.y - startPos.y)*t
                         };
      enemy.attr('cx', enemyNextPos.x).attr('cy', enemyNextPos.y);
    }

  }



  // render enemies on screen
  enemies
    .transition()
      .duration(100)
      .attr('r', 10)
    .transition()
      .duration(5000)
      .tween('custom', tweenWithCollisionDetection);
}


function play() {
  function gameTurn() {
    newEnemyPositions = createEnemies();
    render(newEnemyPositions);

  }

  gameTurn();
  setInterval(gameTurn, 5000);
  setInterval(function() { increaseScore(); }, 50);

}


play();

// old player code
// ***********

// function Player() {
//   this.path = 'm-7.5,1.62413c0,-5.04095 4.08318,-9.12413 9.12414,-9.12413c5.04096,0 9.70345,5.53145 11.87586,9.12413c-2.02759,2.72372 -6.8349,9.12415 -11.87586,9.12415c-5.04096,0 -9.12414,-4.08318 -9.12414,-9.12415z';
//   this.fill = '#ff6600';
//   this.x = 0;
//   this.y = 0; 
//   this.angle = 0;
//   this.r = 5;
//   this.el = undefined;


// }

// Player.prototype.transform = function(opts) {
//   //this.angle = opts.angle || this.angle;
//   this.setX( opts.x || this.x );
//   this.setY( opts.y || this.y );
//   console.log(this.x, this.y);
//   //"rotate(#{},#{@x},#{@getY()}) "
//   // var translateString = "translate("+this.x+","+this.y+")";
//   // this.el.attr('transform', translateString);
//   this.el.attr('transform', ("translate(" + (this.x) + "," + this.y + ")"));
// }

// Player.prototype.moveAbsolute = function(x, y){
//   this.transform({x: x, y: y});
// }

// Player.prototype.moveRelative = function(dx, dy){
//   //console.log(dx, dy);
//   this.transform({x: this.x + dx, y: this.y + dy});
// }

// Player.prototype.setupDragging = function() {
//   var dragMove = function() {
//     //console.log(d3.event.dx, d3.event.dy);
//     this.moveRelative.call(this, d3.event.dx, d3.event.dy);
//   }.bind(this);
//   var drag = d3.behavior.drag()
//               .on('drag', dragMove);

//   this.el.call(drag); // D3 magic
// }

// Player.prototype.setX = function(x) {
//   var minX = gameOptions.padding;
//   var maxX = gameOptions.width - gameOptions.padding;
//   x = (x >= minX) ? x : minX;
//   x = (x <= maxX) ? x : maxX;
//   this.x = x;
// }

// Player.prototype.setY = function(y) {
//   var minY = gameOptions.padding;
//   var maxY = gameOptions.width - gameOptions.padding;
//   y = (y <= minY) ? y : minY;
//   y = (y >= maxY) ? y : maxY;
//   this.y = y;
// }

// Player.prototype.render = function(to) {
//   this.el = to.append('svg:path')
//             .attr('d', this.path)
//             .attr('fill', this.fill);

//   this.transform({x: gameOptions.width * 0.5,
//                   y: gameOptions.height * 0.5});

//   this.setupDragging(); 
// }

// var players = [];
// var newPlayer = new Player();
// newPlayer.render(gameBoard)
// players.push(newPlayer);
