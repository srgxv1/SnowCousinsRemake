
var inheritsFrom = function (child, parent) 
{
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;
};

//1. CLASE OBJETO
var Objeto = function (juego, x, y, sprite)
{
    this.juego = juego;
    Phaser.Sprite.call(this, juego, x, y, sprite);
    this.anchor.set(0.5); // Ancla al personaje a no tengo ni puta idea y no voy a mirarlo porque no me importa
    this.juego.physics.enable(this, Phaser.Physics.ARCADE);    // Activa las fisicas del personaje
    this.body.bounce.y = 0.2; // Hace que el personaje rebote al caer al suelo
    this.body.collideWorldBounds = true; // Ni lo se ni me importa
    this.juego.add.existing(this);
    this.body.immovable = true;
}
inheritsFrom(Objeto, Phaser.Sprite);



//2. CLASE OBJETO MOVIL
var ObjetoMovil = function (juego, x, y, sprite, facing)
{
    Objeto.call(this, juego, x, y, sprite);
    // Variables especificas del ObjetoMovil
    this._facing = facing;  // Punto de mira, -1 o 1

}
inheritsFrom(ObjetoMovil, Objeto);


//3. CLASE SER VIVO
var SerVivo = function (juego, x, y, sprite, facing, vidas)
{
    ObjetoMovil.call(this, juego, x, y, sprite, facing);
    this._vidas = vidas;  // Numero de vidas
    this.canShoot = true;
}
inheritsFrom(SerVivo, ObjetoMovil);



//5. CLASE ENEMY
var Enemy = function(juego, x, y, sprite, facing, vida)
{
    SerVivo.call(this, juego, x, y, sprite, facing, vida);
    this.originalSprite = sprite;
    this.sleepTime=0;
    this.maxJump;
    this.convertedTime=0;
    this.timeCheck=0;
    this.convertido = false;
    this.body.immovable = true;
    this.empujadoDebajo = false;
    this.empujado = false;
    this.snowCount = -1;
    this.canJump = false;
    this.jumpTimer = 0;
    this.bolaNieve = false;
    this.CONVERTED_TIME = 1150;
    this.auxKey = sprite;

    this._miniBallSound = this.game.add.audio('miniBall');

}
inheritsFrom(Enemy,SerVivo);

Enemy.prototype.collisions = function(map)
{      
    this.canJump = false;
    // Colision entre el player y el mapa
        // Colision entre la estrella y el player   
    for(var i = 0; i < this.game.playerGroup.length; i++){
        this.game.physics.arcade.collide(this, this.game.playerGroup.children[i].playerWeapon._weapon.bullets,   // Colision entre las balas y la estrella
            function collisionHandler(enem, bullet)    // Funcion que destruye las balas y la estrella
            {  
                bullet.kill();
                enem._miniBallSound.play();
                enem.convertido = true;
                enem.timeCheck = enem.game.time.now;
                
                if(enem.snowCount < 4)
                {
                    enem.snowCount++;
                    enem.game.playerGroup.children[i].addScore(20);
                }
            });
    }

    
    this.game.physics.arcade.collide(this, this.map._layer,function collisionSides(enemy){
        if(enemy.body.blocked.right){
            enemy._facing = -1;
        }
        else if(enemy.body.blocked.left){
            enemy._facing = 1;
        }
    });

    this.game.physics.arcade.overlap(this, map._jumpGroup, 
        function jumpCol(enem, group)
        {
            enem.canJump = true;
        });
    
    this.dead(map);
    this.collBwEnemy();
}

Enemy.prototype.dead = function(map)
{
    if(this.convertido && this.snowCount >= 3)
    {
        this.game.physics.arcade.overlap(this, map._destroyBallGroup, 
            function dead(enem, group)
            {
                enem.kill();
                enem.canShoot = false;
                enem.game.numEnemy--;
            });
    }
}

Enemy.prototype.jump = function()
{
    if(this.canJump && this.juego.rnd.integerInRange(0, 100) > 90)
    {
       this.body.checkCollision.up = false;
       this.body.velocity.y = -290;
       this.jumpTimer = this.juego.time.now;
    }
}

Enemy.prototype.snowBall = function(){

    if(this.convertido){

        this.body.velocity.x = 0;
       this.body.checkCollision.up = true;
       
        if(this.snowCount == 0)
        {
            this.body.setSize(40, 38, 0, -1);
            this.loadTexture('ball0');
        }
        else if (this.snowCount == 1){
            this.body.setSize(43, 40, 0, -1);
            this.loadTexture('ball1');
        }
        else if (this.snowCount == 2){
            this.body.setSize(44, 40, 0, 0);
            this.loadTexture('ball2');
        }
        else if (this.snowCount == 3){
            this.body.setSize(45, 40, 0, 0);
            this.loadTexture('ball3');
        }

        if(this.empujado)
        {
            this.body.velocity.x = 200 * this._facing;
            this.body.rotation = (20 * this._facing) + this.body.rotation;
            this.body.drag.setTo(0);
            this.body.immovable = true;
        } 
        else {
            if (this.game.time.now - this.timeCheck > this.CONVERTED_TIME )
            {
            if(this.snowCount >=0)
            {
                this.snowCount--; 
                this.timeCheck = this.game.time.now;  
            }
            else if(this.snowCount <=-1){
                this.convertido = false;
                this.loadTexture(this.auxKey);
            }
                
            }
        }
        if(this.body.onFloor()){
            
            this.body.immovable = false;
        }
        else this.body.drag.setTo(0);
    }
   
}

Enemy.prototype.collBwEnemy = function()
{
    if(this.body.onFloor()){
        if (this.empujado)
        {
            this.game.physics.arcade.collide(this, this.game.EnemyGroup.children,   // Colision entre las balas y la estrella
                function collisionHandler(enem, child)    // Funcion que destruye las balas y la estrella
                { 
                    for (var i = 0; i < enem.game.playerGroup.children.length; i++)
                        enem.game.playerGroup.children[i].addScore(200);
                    child.kill();
                    child.canShoot = false;
                    enem.game.numEnemy--;
                    child.body.immovable = true;
                });
        }

        else
        {
            this.game.physics.arcade.collide(this, this.game.EnemyGroup.children,
                function collisionHandler(enem, child)
                {
                if(child.body.touching.right){
                    child._facing = -1;
                    }
                    else if(child.body.touching.left){
                    child._facing = 1;
                        }
                    
                    if(enem.body.touching.right){
                        enem._facing = -1;
                    }
                    else if(enem.body.touching.left){
                        enem._facing = 1;
                    }
                });
        }
    }
}


//9. CLASE WEAPON
var Weapon = function (juego, character, numBullets, maxTime, bulletSpeed, fireRate, x, y, sprite, bulletKillType)
{
    // Variables especificas del Weapon
    this._weapon = juego.add.weapon(numBullets, sprite);    // Crea "numBullets" balas como maximo en pantalla usando la imagen 'bullet'      
    this._weapon.bulletKillType = bulletKillType;  //Las balas desapareceran al cabo del tiempo
    if(maxTime != -1)
    {
        this._weapon.bulletLifespan = maxTime;  // Las balas desapareceran automaticamente al pasar el tiempo de "maxTime"        
    }
    this._weapon.fireRate = fireRate;  // FireRate
    this._weapon.bulletWorldWrap = false;  // Para que no desaparezcan por un lado y aparezcan por el otro del mundo
    this._weapon.trackSprite(character, x, y, true);    // Coloca el arma junto al player
    this._bulletSpeed = bulletSpeed;

    this.changeBulletSpeed = function(speed)
    {
        this._bulletSpeed = speed;
    };
    this.directionBullet = function(direction)
    {
            this._weapon.bulletSpeed = character.body.velocity.x + (direction * this._bulletSpeed);
    };
    this.changeFireRate = function(fire)
    {
        this._weapon.fireRate = fire;
    };
}

//12. CLASE BOSS

module.exports = {
    Objeto, 
    ObjetoMovil, 
    SerVivo,  
    Weapon,
    Enemy,
};