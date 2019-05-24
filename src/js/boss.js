var herencia = require('./herencia.js')
var PinkEnemy = require('./pinkEnemy.js')
var SerVivo = herencia.SerVivo;
var Weapon = herencia.Weapon;

var Boss = function(juego, x, y, sprite, facing, vida, map)
{
    this.map = map;
    SerVivo.call(this, juego, x, y, sprite, facing, vida);
    this.bossTimer = 5000;
    this.velJump = 0;
}
Boss.prototype = Object.create(SerVivo.prototype);
Boss.prototype.constructor = Boss;

Boss.prototype.update = function()
{
    this.collisions();
    if (this._vidas > 20)
    {
        this.jump();
    }
    else if (this._vidas > 10)
        this.frame = 3;
    else if (this._vidas >= 0)
        this.frame = 4;
    else
        this.kill();
},

Boss.prototype.setCollide = function()
{
    if (this.frame == 0)
        this.body.setSize(60, 135, 60, 25);
    else if (this.frame == 1 || this.frame == 2)
        this.body.setSize(78, 132, 40, 25);
    else if (this.frame == 3)
        this.body.setSize(78, 118, 40, 40);
    else if (this.frame == 4)
        this.body.setSize(78, 93, 40, 65);
},

Boss.prototype.collisions = function()
{
    this.setCollide();
    this.body.checkCollision.up = false;
    this.game.physics.arcade.collide(this, this.map._layer);


    this.game.physics.arcade.overlap(this, this.game.EnemyGroup.children, 
        function collisionHandler(boss, enem)
        {
            enem.kill();
            if (enem.empujado)
            {
                boss._vidas -= 5;
            }
            enem.game.numEnemy--;
        });

        for(var i = 0; i < this.game.playerGroup.length; i++)
        {
            this.game.physics.arcade.overlap(this, this.game.playerGroup.children[i].playerWeapon._weapon.bullets,   // Colision entre las balas y la estrella
                function collisionHandler(boss, bullet)    // Funcion que destruye las balas y la estrella
                {  
                    bullet.kill();
                    boss._vidas--;
                    boss.game.playerGroup.children[i].addScore(50);
                });
        }
},



//SALTO
Boss.prototype.jump = function()
{
    if (this.body.onFloor()) 
    {
        this.frame = 0;
        this.velocityJump();
    }
    else
        this.jumpCol();
},

Boss.prototype.velocityJump = function()
{
    if (this.game.time.now > this.bossTimer) 
    { 
        this.frame = 2;
        if (this.body.y < 300)
        {
            this.body.velocity.y = -200;
            this.velJump = -200;
        }
        else 
        {
            this.body.velocity.y = -330;
            this.velJump = -330
        }

        if (this.canCreateEnemy())
        {
            this.frame = 1;
            this.createEnemy();
        }
        this.bossTimer = this.game.time.now + 3000 + Math.random() * 6000;
    }
},

Boss.prototype.jumpCol = function()
{
    if (this.body.y < 300 && this.velJump == -200)
        this.body.checkCollision.down = false;
    else if (this.body.y < 300 && this.velJump == -330)
        this.body.checkCollision.down = true;
    else if(this.body.y >= 300)
        this.body.checkCollision.down = true;
},


//CREA ENEMIGOS
Boss.prototype.createEnemy = function()
{
    this.numEnemy = this.game.rnd.integerInRange(1, 2);
    this.posX = 0;
    this.posY = 0;
    this.game.numEnemy += this.numEnemy;
    for (var i = 0; i < this.numEnemy; i ++)

    {   this.posX = this.game.rnd.integerInRange(150, 500);
        this.posY = this.game.rnd.integerInRange(120, 500);
        var enemy = new PinkEnemy(this.game, this.posX, this.posY, 'pink', -1, 3, this.map);
        enemy.body.velocity.x = 1000;
        enemy.body.velocity.y = -200;
        this.game.EnemyGroup.children.push(enemy);
    }
    this.frame == 0;
}

Boss.prototype.canCreateEnemy = function()
{
    this.c = this.game.rnd.integerInRange(0, 2);
    this.can = false;
    if (this.c == 2)
        this.can = false;
    else
        this.can = true;

    return this.can;
}

module.exports = Boss;