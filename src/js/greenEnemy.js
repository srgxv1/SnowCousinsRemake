var herencia = require('./herencia.js')
var Enemy = herencia.Enemy;
var Weapon = herencia.Weapon;

const CONVERTED_TIME = 3000;
const VELOCITY = 120;
const TIME_BTW_JUMPS = 7000;

var GreenEnemy = function(juego, x, y, sprite, facing, vida, weaponSprite, map)
{
    this.limiteIzd = 246;
    this.limiteDrch = 400;
    this.map = map;

    Enemy.call(this, juego, x, y, sprite, facing, vida);

    this.greenWeapon = new Weapon(this.game, this, 1, -1, 300, 3000, 0, 0, weaponSprite, Phaser.Weapon.KILL_WORLD_BOUNDS);
    this.greenWeapon._weapon.bulletGravity.y = -260;
    this.greenTimer = 3000;
    this.aleatorio = 0;
    this._greenMov=false;

    this.animations.add('walk', [0, 1, 2, 3], 15, true);   // Animacion para la derecha, usando los mismos frames que para la izquierda
    this.animations.add('attack', [5, 6], 10, false);
    this.animations.add('dead', [4], 10, true);

    this.body.setSize(29, 38, 16, 18);
}

GreenEnemy.prototype = Object.create(Enemy.prototype);
GreenEnemy.prototype.constructor = GreenEnemy;

GreenEnemy.prototype.update = function()
{
   
    this.collisions(this.map, this.game.EnemyGroup);
    

    this.game.physics.arcade.collide(this.greenWeapon._weapon.bullets, this.map._layer, 
        function destroyGreenBullets(bullets)
        {
            bullets.kill();
        });

    this.game.physics.arcade.collide(this.greenWeapon._weapon.bullets, this.game.playerGroup.children, 
        function destroyGreenBullets(player, bullets)
        {
            player.destroyLife();
            bullets.kill();
        });
    this.body.velocity.x *= this._facing ; 
    this.snowBall();
    if(!this.convertido) {

        this.body.setSize(29, 38, 16, 18);
        this.loadTexture('green');

        if (this.canShoot)
        {
            if(this.body.onFloor() && this.aleatorio >= 1)
            {
                this.greenWeapon.directionBullet(this._facing);
                this.greenWeapon._weapon.fire();
            }
        }

        if(!this._greenMov)
        {
            this.body.velocity.x = 0; 
        }

        if ( this._greenMov && this.body.onFloor())
        {
            this.body.velocity.x = VELOCITY * this._facing ;
            this.scale.setTo(-this._facing, 1);
            this.animations.play('walk');
        }

        if (this.game.time.now > this.greenTimer) 
        { 
            this.toogleMov();
            this.greenTimer = this.game.time.now + 1000 + Math.random() * 2000;
            this.aleatorio = this.game.rnd.integerInRange(0,2);
        }
        if(!this.body.onFloor())this.body.velocity.x = 0;

        if(!this.empujado)
        {
            if(this.body.velocity.x > 0 && this.body.x >= this.limiteDrch ||
                this.body.velocity.x < 0 && this.body.x <=  this.limiteIzd  )
            {
                this._facing *= -1;
            }
        }
        if (this.body.onFloor() && this.game.time.now - this.jumpTimer > TIME_BTW_JUMPS){
            
            this.jump();
        }
    }
},

GreenEnemy.prototype.manageEmpujon = function()
{        
        this.body.velocity.y = -250;
        this.empujadoDebajo = false;
},

GreenEnemy.prototype.toogleMov = function()
{
    this._greenMov = !this._greenMov;
}

GreenEnemy.prototype.changeAngle = function(facing)
{
    if(facing == -1) this.greenWeapon._weapon.fireAngle = Phaser.ANGLE_LEFT;

    else this.greenWeapon._weapon.fireAngle = Phaser.ANGLE_RIGHT;
}

module.exports = GreenEnemy;