var herencia = require('./herencia.js')
var SerVivo = herencia.SerVivo;
var Weapon = herencia.Weapon;

var Character = herencia.Character;

const INVULNERABLE = 3000;

const JUMP_VELOCITY = -290;
const JUMP_FROM_BALL = -70;


var Player = function(juego, x, y, sprite, facing, vida, weaponSprite, map)
{
    this.velocity = 100;
    this.map = map;
    this.enemyGroup = juego.EnemyGroup;

    herencia.SerVivo.call(this, juego, x, y, sprite, facing, vida);

    this.defX = x; // quitadlo, pecado capital
    this.defY = y;

    this.playerWeapon = new Weapon(this.game, this, 30, 2000, 200, 200, 0, 0, weaponSprite, Phaser.Weapon.KILL_LIFESPAN);

    this.montado = false;

    this.animations.add('create', [11, 0, 1], 4, true);
    this.animations.add('walk', [2, 4, 5, 6], 15, true);   // Animacion para la derecha, usando los mismos frames que para la izquierda
    this.animations.add('attack', [7, 8, 9], 15, true);
    this.animations.add('jump', [3], 10, true);
    this.animations.add('dead', [10, 11], 10, true);

    this.prevX;
    this.prevY;
    this.empujando = false;
    this._shoot = false;
    this._create = true;

    this._shootSound = this.game.add.audio('playerShoot');  //Sonido del disparo
    this._jumpSound = this.game.add.audio('playerJump');    //Sonido del salto
    this._snowShoot = this.game.add.audio('snowShoot');
    this._hurt = this.game.add.audio('playerHurt');

    this.body.setSize(23, 38, 19, 15);
    this.body.immovable = false;
    this.invulnerableTime = 0;

    this.lives = []
    this.livesPosX = 0;
    this.livesPosY = 500;

    this.score = 0;
}
Player.prototype = Object.create(SerVivo.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function()
{   
    this.collisions();
    
    this.body.velocity.x = 0;   // Al principio el personaje no se mueve
        //Comprobar si el personaje esta haciendo una animacion

    if (this._shoot && this.frame == 9)
        this.changeBoolean(false, this._create);

    if (this.frame == 1)
        this.changeBoolean(this._shoot, false);

    //Movimiento del personaje a la izquierda
    if (this.cursors.left.isDown)
        this.walk(-1);

    //Movimiento del personaje a la derecha
    else if (this.cursors.right.isDown)
        this.walk(1);  
        
    //El personaje esta parado
    else if (!this._shoot && !this._create)
    {
        this.animations.stop(); // Si no detecta inputs, parar las animaciones

        if (this._facing == -1)
            this.scale.setTo(-1, 1);
        
        this.frame = 1;
    }

    //Animacion para cuando se crea
    else if (this._create)
        this.animations.play('create');
    
    //Controla el salto y las colisiones
    if (this.body.onFloor())
    {   
        //Si el jugador pulsa el boton para saltar
        if (this.cursors.up.isDown)
        {               
            this.changeBoolean(this._shoot, false);
            if (this.body.x > 100 && this.body.x < 700)
                this.sidesCollisions(this, false, false);

            this.animations.play('jump');    //Hace la animacion del salto
            this._jumpSound.play(); //Sonido para el salto

                this.changeVelocity(this.body.velocity.x, JUMP_VELOCITY); //Cambia la velocidad de la y para que salte
        }
        //Si no lo pulsa
        else
            this.sidesCollisions(this, true, true);
    }
    else
    { 
        //Si el personaje esta en el aire, le quita las colisiones para el interior del borde
        if (this.body.x > 100 && this.body.x < 700)
            this.sidesCollisions(this, false, false);
        //Le pone las colisiones para que no atraviese el borde
        else
            this.sidesCollisions(this, true, true);
    }
    
    //Disparo
    if (this.canShoot)
    {
        if (!this.empujando && this.cursors.fireButton.downDuration(1))
        {
            if (this._facing == -1)
                this.scale.setTo(-1, 1);
                
            this.changeBoolean(true, false);
            this.playerWeapon.directionBullet(this._facing); //Asigna la direccion del personaje a la de la bala
            this.playerWeapon._weapon.fire();  //Dispara
            this.animations.play('attack');  //Hace la animacion de atacar
            this._shootSound.play();    //Sonido de atacar
        }
    }
},

//Metodo que controla las colisiones del personaje
Player.prototype.collisions = function()
{
    //Para que atraviese el techo, pero no el borde superior
    if (this.body.y < 100)
        this.body.checkCollision.up = true;
    else
        this.body.checkCollision.up = false;

    this.game.physics.arcade.collide(this, this.map._layer);  // Colision entre el player y el mapa

    
       
        if(this.game.physics.arcade.collide(this.game.EnemyGroup.children, this,
        function empujar(enemy, player){
            if(enemy.convertido)
            { 
                if(!enemy.empujado && player.cursors.fireButton.downDuration(1) && enemy.snowCount >= 3)
                {
                    if(enemy.body.touching.up)
                    {
                        player.body.velocity.y = JUMP_FROM_BALL;
                    }  
                    enemy._facing = player._facing;
                    enemy.empujado = true;
                    player.empujando = false;
                    player.addScore(100);
                    player._snowShoot.play();
                }
            }
            else 
            {
                player.destroyLife();
            }
        })&& this.enemyGroup.children.convertido)
        {
            this.empujando = true;
        } 
        else 
            this.empujando = false;
         

    this.game.physics.arcade.collide(this.map._layer, this.playerWeapon._weapon.bullets,     // Colsicion entre las balas del arma y el mapa
    function collisionHandler(bullet)   // Funcion que destruye las balas
    {
        bullet.kill();
    }, 
    null, this);

    this.game.physics.arcade.overlap(this, this.game.Boss, 
        function collisionHandler(player, boss)
        {
            player.destroyLife();
        });
},

Player.prototype.destroyLife = function()
{
    this.body.y = this.defY;
    this.body.x = this.defX;
    this._vidas--; 
    this._hurt.play();
    this.lives[this._vidas].visible = false;
},

Player.prototype.changeBoolean = function(shoot, create)
{
    this._shoot = shoot;
    this._create = create;
},

//Metodo para andar
Player.prototype.walk = function(num)
{
    this.changeBoolean(false, false);            
    this.scale.setTo(num, 1);    // Esto es para usar los sprites de la izquierda, pero invertirlos para que se usen para la derecha
    this.body.velocity.x = num * this.velocity;
    this.animations.play('walk');

    this._facing = num;
},

Player.prototype.sidesCollisions = function(right, left)
{
    this.body.checkCollision.right = right;
    this.body.checkCollision.left = left;
},

Player.prototype.addScore = function(num)
{
    this.score += num;
},

Player.prototype.setControllerKeys = function(fireKey, left, up, right){

    //this.cursors = this.juego.input.keyboard.createCursorKeys();
    this.cursors =  
    {
        up: this.game.input.keyboard.addKey(up),
        left: this.game.input.keyboard.addKey(left),
        right: this.game.input.keyboard.addKey(right),
        fireButton : this.game.input.keyboard.addKey(fireKey),
    } 
}, 
Player.prototype.changeVelocity = function(velX, velY)
{
    this.body.velocity.x = velX;
    this.body.velocity.y = velY;
},


Player.prototype.liveSprites = function(posX, posY)
{
    for (var i = 0; i < this._vidas; i++)
    {
        this.lives.push(this.game.add.sprite(posX, posY, 'live'));
        posY += 50;
    }
},

Player.prototype.getVidas = function()
{
    return this._vidas;
}


module.exports = Player;