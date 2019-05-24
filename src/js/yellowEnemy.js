var herencia = require('./herencia.js')
var Enemy = herencia.Enemy;

//limite izda 80
// limite drcha 698
// centro 309
//const SLEEP_TIME = 5000;
const CONVERTED_TIME = 3000;
const TIME_BTW_JUMPS = 10000;
const VELOCITY = 200;

var YellowEnemy = function(juego, x, y, sprite, facing, vida, map)
{

    this.map = map;
    this.limiteIzda = 0;
    this.limiteDrch = juego.width;

    Enemy.call(this, juego, x, y, sprite, facing, vida);
    this.yelMove = true;
    this.stopTime = 0;

    this.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], 15, false);   // Animacion para la derecha, usando los mismos frames que para la izquierda
    this.animations.currentAnim.onComplete.add(function(){this.yelMove = false;}, this);

    this.body.setSize(45, 33, 12, 23);
}
YellowEnemy.prototype = Object.create(Enemy.prototype);
YellowEnemy.prototype.constructor = YellowEnemy;


YellowEnemy.prototype.update = function()
{
    
    this.collisions(this.map, this.game.EnemyGroup);

    if(this.convertido)
    {
        this.snowBall();
    }

    else 
    {
        this.body.setSize(45, 33, 12, 23);
       

        if(!this.yelMove)
        {
            this.body.velocity.x = 0;
            this.animations.stop();
        }

        if (this.yelMove)
        {
            this.body.velocity.x = VELOCITY * this._facing; 
            this.scale.setTo(this._facing, 1);
            this.animations.play('walk');
        }

        if(this.body.velocity.x > 0 && this.body.x >= this.limiteDrch ||
            this.body.velocity.x < 0 && this.body.x <=  this.limiteIzda  )
        {
            this._facing *= -1;
        }

        if (this.game.time.now > this.sleepTime)
        {
            this.stopTime = this.game.rnd.integerInRange(3000, 8000);
            this.sleepTime = this.game.time.now + this.stopTime;
            this.toogleMov();    
        }        
    }
},

YellowEnemy.prototype.toogleMov = function()
{
    this.yelMove = true;
},

module.exports = YellowEnemy;