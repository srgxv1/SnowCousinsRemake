var herencia = require('./herencia.js')
var Enemy = herencia.Enemy;

//limite izda 80
// limite drcha 698
// centro 309

const SLEEP_TIME = 1000;
const VELOCITY = 100;
const TIME_BTW_JUMPS = 7000;


var PinkEnemy = function(juego, x, y, sprite, facing, vida, map)
{
    this.map = map;
    Enemy.call(this, juego, x, y, sprite, facing, vida);
    this.pinkMove = false;
    this.pinkTimer = 3000;

    this.animations.add('walk', [0, 1, 2, 3], 15, true);
    this.animations.add('dead', [4], 10, true);
    this.body.setSize(32, 35, 16, 13); 
}
PinkEnemy.prototype = Object.create(Enemy.prototype);
PinkEnemy.prototype.constructor = PinkEnemy;


PinkEnemy.prototype.update = function()
{
    
    this.collisions(this.map, this.game.EnemyGroup);

    this.body.velocity.x *= this._facing;

    this.snowBall();
    if(!this.convertido)
    {
        this.body.setSize(32, 35, 16, 13);
        

        if (this.game.time.now > this.pinkTimer) 
        { 
            this.toogleMove();
            this.pinkTimer = this.game.time.now + 1000 + Math.random() * 2000;
        }
        if(this.pinkMove) {
            this.body.velocity.x = VELOCITY * this._facing;
            this.scale.setTo(-this._facing, 1);
            this.animations.play('walk');
        }

        else {
            this.body.velocity.x = 0;
            this.animations.stop('walk');
        } 

        if(!this.body.onFloor())this.body.velocity.x = 0;

        if (this.body.onFloor() && this.game.time.now - this.jumpTimer > TIME_BTW_JUMPS){
            
            this.jump();
        }
       
    }
},

PinkEnemy.prototype.toogleMove = function()
{
    this.pinkMove = !this.pinkMove;
},

module.exports = PinkEnemy;