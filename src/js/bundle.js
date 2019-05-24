(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./herencia.js":4,"./pinkEnemy.js":9}],2:[function(require,module,exports){
var herencia = require('./herencia.js')

var Enemy = 
{
    collisionsEnemy: function(juego, player, enemy, weapon, layer)
    {
        juego.physics.arcade.collide(enemy._obj, layer);  // Colision entre el player y el mapa
        juego.physics.arcade.collide(enemy._obj, player._obj);    // Colision entre la estrella y el player
        juego.physics.arcade.collide(enemy._obj, weapon._weapon.bullets,   // Colision entre las balas y la estrella
        function collisionHandler(enemigo, bullet)    // Funcion que destruye las balas y la estrella
        {
            enemigo = enemy;
            bullet.kill();
            enemigo.convertido = true;
            this.timeCheck = juego.time.now;
            if (enemigo._vida > 0)
            {
                enemigo._obj.tint = Math.random() * 0xffffff;
                enemigo._vida--;
            }
            else
                enemigo._obj.kill();
        }, 
        null, this);
    },
}
module.exports = Enemy;


},{"./herencia.js":4}],3:[function(require,module,exports){
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
},{"./herencia.js":4}],4:[function(require,module,exports){

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
},{}],5:[function(require,module,exports){
var readyCont = 0;

var HUD = 
{
    p1Text: null,

    p2Text: null,

    hiText: null,

    levelText: null,
    level: null,

    coin: null,
    coinTimer: 500,

    create: function(game, secChar, level)
    {
        this.scores = [];
        this.game = game;

        this.p1Text = text(this.game, this.p1Text, 200, 35, '1P', 30, 0x00A2FF);
        this.scores[0] = text(this.game, this.punt1Text, 250, 35, '0', 30, 0xE48100);

        this.p2Text = text(this.game, this.p2Text, 500, 35, '2P', 30, 0xFF0066);

        this.scores[1] = text(this.game, this.punt2Text, 550, 35, '0', 30, 0xE48100);

        if (!secChar)
        {
            this.coin = text(this.game, this.coin, 615, 10, 'INSERT COIN', 30, 0xFFA5F4);
            this.scores[1].visible = false;
        }

        this.level = 'LEVEL ' + (level + 1);
        this.levelText = text(this.game, this.levelText, 325, 5, this.level, 32, 0xFFFFFF);
    },

    update: function(secChar, punt)
    {        
        this.insertCoinText(secChar);

        for (var i = 0; i < punt.length; i++)
            this.puntPlayer(this.scores[i], punt[i]);
    },

    insertCoinText: function(secChar)
    {
        if (secChar && this.punt2Text == null)
        {
            this.coin.destroy();
            this.scores[1].visible = true;
        }

        else
        {
            if (this.game.time.now > this.coinTimer) 
            { 
                this.coinTimer = this.game.time.now + 500;
                this.coin.visible = !this.coin.visible;
            }
        }
    },

    puntPlayer: function(texto, score)
    {
        texto.setText('' + score.toString());

        return texto;
    },
}

var StartCont = {

    ready: null,
    readyTimer: null,

    create: function(game)
    {
        readyCont = 0;
        this.game = game;
        this.ready = text(this.game, this.ready, 290, 260, 'READY', 80, 0x000000);
        this.readyTimer = this.game.time.now + 1500;
    },

    update: function()
    {
        this.startCont();
        this.startText();
    },

    startText: function()
    {
        if (readyCont == 1)
        {
            this.ready.position.x = 265;
            this.ready.setText('STEADY');
        }
        else if (readyCont == 2)
        {
            this.ready.position.x = 360;
            this.ready.setText('GO');
        }
        else if (readyCont > 2)
        {
            this.ready.visible = false;
            this.game.state.start('play');
        }
    },

    startCont: function()
    {
        if (this.game.time.now > this.readyTimer)
        {
            this.readyTimer = this.game.time.now + 1500;
            readyCont++;
        }
    },
};

function text(game, texto, posX, posY, string, tam, color)
{
    texto = game.add.bitmapText(posX, posY, 'nokia', string, tam);
    texto.tint = color;

    return texto;
};

module.exports = {HUD, StartCont};
},{}],6:[function(require,module,exports){
'use strict';

var PlayScene = require('./play_scene.js');
var Menu = require ('./menu.js');

var BootScene = {
  create: function () {
    this.game.state.start('preloader');
  }
};


var PreloaderScene = {
  preload: function () {
    this.game.load.baseURL = 'https://sergvx.github.io/PVLI/src/';
    this.game.load.crossOrigin = 'anonymous';

    // TODO: load here the assets for the game

    //Assets para el menu
    this.game.load.image('fondoMenu', 'images/fondoMenu.jpg');
    this.game.load.image('contButton', 'images/controlesButton.png');
    this.game.load.image('partButton', 'images/nuevaPartidaButton.png');
    this.game.load.image('menuButton', 'images/menuButton.png');
    this.game.load.image('controles', 'images/controles.png');    
    this.game.load.image('flecha', 'images/flecha.png');    
    this.game.load.image('fondoPause','images/pause.png');
    this.game.load.image('fondoMenuMuerte','images/fondoMenuMuerte.jpg');
    this.game.load.image('fondoMenuVictoria','images/menuVictoria.png');
    this.game.load.image('fondoReady','images/ready.png');

    //Assets para los niveles
    this.game.load.tilemap('level1', 'levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.text('level1JSON', 'levels/level1.json');
    
    this.game.load.tilemap('level2', 'levels/level2.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.text('level2JSON', 'levels/level2.json');
    
    this.game.load.tilemap('level3', 'levels/level3.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.text('level3JSON', 'levels/level3.json');
    
    this.game.load.tilemap('level4', 'levels/level4.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.text('level4JSON', 'levels/level4.json');
    
    this.game.load.tilemap('levelBoss', 'levels/levelBoss.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.text('levelBossJSON', 'levels/levelBoss.json');
    
    this.game.load.image('tiles-1', 'levels/Winter.png');
    this.game.load.image('background', 'images/fondo1.png');
    this.game.load.spritesheet('speaker', 'images/speaker.png', 30, 30);

    //Assets para los players
    this.game.load.spritesheet('player1', 'images/Player1.png', 60, 60);
    this.game.load.spritesheet('player2', 'images/Player2.png', 60, 60);
    this.game.load.image('bullet', 'images/bullet.png');
    this.game.load.image('live', 'images/heart.png');


    //Assets para los enemigos
    this.game.load.spritesheet('yellow', 'images/YellowEnemy.png', 70, 70);

    this.game.load.spritesheet('pink', 'images/PinkEnemy.png', 60, 60);

    this.game.load.spritesheet('green', 'images/GreenEnemy.png', 60, 60);
    this.game.load.spritesheet('fireBall', 'images/fireBall.png', 60, 60);

    this.game.load.image('ball0','images/ball0.png');
    this.game.load.image('ball1','images/ball1.png');
    this.game.load.image('ball2','images/ball2.png');
    this.game.load.image('ball3','images/ball3.png');

    this.game.load.spritesheet('boss', 'images/bossSpriteSheet.png', 160, 160);

    //Assets powerups
    this.game.load.spritesheet('potion', 'images/potions.png', 32, 27);
    this.game.load.audio('pickPotion', 'sounds/potion.ogg');

    //Audios
    this.game.load.audio('gameMusic', 'sounds/game.ogg');
    this.game.load.audio('playerShoot', 'sounds/playerShoot.ogg');
    this.game.load.audio('miniBall', 'sounds/miniBallHit.ogg');
    this.game.load.audio('snowShoot', 'sounds/snowBall.ogg');
    this.game.load.audio('playerJump', 'sounds/playerJump.ogg');
    this.game.load.audio('bossMusic', 'sounds/bossMusic.ogg');
    this.game.load.audio('menuMusic', 'sounds/menuMusic.ogg');
    this.game.load.audio('buttonClick', 'sounds/button.ogg');
    this.game.load.audio('gameOver', 'sounds/gameOver.ogg');
    this.game.load.audio('win', 'sounds/win.ogg');
    this.game.load.audio('createPlayer2', 'sounds/player2.ogg');
    this.game.load.audio('playerHurt', 'sounds/playerHurt.ogg');
    

    //Fonts
    this.game.load.bitmapFont('nokia', 'fonts/nokia.png', 'fonts/nokia.xml');
  },

  create: function () {
    this.game.state.start('menu');
  }
};


window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayScene);
  game.state.add('menu', Menu.Menu);
  game.state.add('estadoMuerte', Menu.menuMuerte);
  game.state.add('estadoVictoria', Menu.menuVictoria);
  game.state.add('estadoReady', Menu.menuReady);

  game.state.start('boot');
};

},{"./menu.js":8,"./play_scene.js":10}],7:[function(require,module,exports){
var herenciaJS = require('./herencia.js')
var Objeto = herenciaJS.Objeto;

var Map = function(game, levelName, jsonName, tileName, layerName)
{
    this.game = game;
    this._levelData = JSON.parse(this.game.cache.getText(jsonName));

    this._jumpGroup = game.add.group();
    this._destroyBallGroup = game.add.group();
    this._posPlayer = [];
    this._posEnemy = [];

    this.createCol(1);
    this.createCol(2);
    this.createPos(3);
    this.createPos(4);

    this.game.physics.startSystem(Phaser.Physics.ARCADE);   // Le pone fisicas al mundo
    
    this.game.stage.backgroundColor = '#000000';    // Po yo me imagino que esto es pa poner el fondo mas negro que el sobaco de un grillo

    this._bg = this.game.add.tileSprite(0, 0, 800, 600, 'background');    // Añade el sprite "background" a la variable bg
    this._bg.fixedToCamera = true;    // Ni puta idea otra vez
    this._map = this.game.add.tilemap(levelName);  // Añade el sprite "level1" a la variable map
    this._map.addTilesetImage(tileName); // Le añade los tiles esos rancios para crear el mapa
    this._map.setCollisionByExclusion([2, 3, 8, 9, 10, 11, 12, 14, 15, 16, 17, 20, 21, 22, 23 , 39, 40, 41, 42, 43, 44, 45,
    46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 74,
    75, 76, 77, 78, 79, 80, 81, 82, 83, 84]);    // Le pone colisiones a los tiles indicados
    

    this._layer = this._map.createLayer(layerName);    // Le asigna el map a la variable layer, convirtiendolo asi en un layer
    //  Un-comment this on to see the collision tiles
    //this._layer.debug = true;
    this.game.physics.arcade.gravity.y = 260;   // Le añade gravedad al mundo
}

Map.prototype.update = function()
{
    this.collisions();
},

Map.prototype.createCol = function(numLayer)
{
    for (var i = 0; i < this._levelData.layers[numLayer].objects.length; i++)
    {
        this._collide = new Objeto(this.game, this._levelData.layers[numLayer].objects[i].x, this._levelData.layers[numLayer].objects[i].y, null);
        this.game.physics.enable(this._collide, Phaser.Physics.ARCADE);
        this._collide.body.setSize(this._levelData.layers[numLayer].objects[i].width, this._levelData.layers[numLayer].objects[i].height, 0, 0);

        if(numLayer == 1) // lo peor
            this._jumpGroup.add(this._collide);
        else if (numLayer == 2)
            this._destroyBallGroup.add(this._collide);
    }
}

Map.prototype.createPos = function(numLayer)
{
    for (var i = 0; i < this._levelData.layers[numLayer].objects.length; i++)
    {
        this._obj = {x: this._levelData.layers[numLayer].objects[i].x, 
                    y: this._levelData.layers[numLayer].objects[i].y, 
                    name: this._levelData.layers[numLayer].objects[i].name,
                    facing: this._levelData.layers[numLayer].objects[i].properties.facing};
        if (numLayer == 3) // lo peorisimo
            this._posEnemy.push(this._obj);
        else if (numLayer == 4)
            this._posPlayer.push(this._obj);
    }
}

Map.prototype.collisions = function()
{
    this.game.physics.arcade.collide(this._layer, this._jumpGroup);
    this.game.physics.arcade.collide(this._layer, this._destroyBallGroup);
}

module.exports = Map;
},{"./herencia.js":4}],8:[function(require,module,exports){
var HudJS = require('./hud.js');

var Menu = 
{
    buttonClick: null,
    menuMusic: null,
    controlesSprite: null,

    create: function()
    {
        this.menuMusic = this.game.add.audio('menuMusic');
        this.menuMusic.loopFull(0.1);

        this.buttonClick = this.game.add.audio('buttonClick');
        this.buttonClick.volume = 0.2;

        this._controles;

        this._bgMenu = this.game.add.tileSprite(0, 0, 800, 600, 'fondoMenu');
         
        this._nuevaPartidaButton = this.game.add.button((this.game.width / 3) - 100, (4 * this.game.height / 5) - 40, 'partButton', this.nuevaPartida,
        this, 2, 1, 0);

        this._controlesButton = this.game.add.button((2 * this.game.width / 3) - 100, (4 * this.game.height / 5) - 40, 'contButton', this.controlesON,
        this, 2, 1, 0);


        this.controlesSprite = this.game.add.sprite(0, 0, 'controles');
        this.controlesSprite.visible = false;

        this._flecha = this.game.add.button(635, 2.2 * this.game.height / 3, 'flecha', this.controlesOFF,
        this, 2, 1, 0);
        this._flecha.visible = false;

        this.muteButton = this.game.add.button(10, 10, 'speaker', function muteGame()
        {
            {
                this.game.sound.mute = !this.game.sound.mute;
            }
        }, this, 2, 1, 0);
    },

    update: function()
    {
        speakerActive(this.game, this.muteButton);
    },

    nuevaPartida: function()
    {
        this.menuMusic.destroy();
        this.buttonClick.play();
        this.game.state.start('estadoReady');
    },

    controlesON: function()
    {
        this.buttonClick.play();
        this._nuevaPartidaButton.visible = false;
        this._controlesButton.visible = false;
        this.controlesSprite.visible = true;
        this._flecha.visible = true;
    },

    controlesOFF: function()
    {
        this.buttonClick.play();
        this._nuevaPartidaButton.visible = true;
        this._controlesButton.visible = true;
        this.controlesSprite.visible = false;
        this._flecha.visible = false;
    },
};

var menuMuerte = {
    gameOverMusic: null,

    create : function(){
        this.gameOverMusic = createFinalMenu(this.game, this.gameOverMusic, 'gameOver', 0.5, 'fondoMenuMuerte');
        this.gameOverMusic.onStop.add(backMenu, this);
        this._volverMenu = this.game.add.button(550, 480, 'menuButton', function backMenu()
        {
            this.gameOverMusic.destroy();
            this.game.state.start('menu');
        }, this, 2, 1, 0);

        this.muteButton = this.game.add.button(10, 10, 'speaker', function muteGame()
        {
            {
                this.game.sound.mute = !this.game.sound.mute;
            }
        }, this, 2, 1, 0);
    },

    update: function()
    {
        speakerActive(this.game, this.muteButton);
    },
};

var menuVictoria = {
    winMusic: null,

    create: function(){
        this.winMusic = createFinalMenu(this.game, this.winMusic, 'win', 0.5, 'fondoMenuVictoria');
        this.winMusic.onStop.add(backMenu, this);
        this._volverMenu = this.game.add.button(550, 480, 'menuButton', function backMenu()
        {
            this.winMusic.destroy();
            this.game.state.start('menu');
        }, this, 2, 1, 0);

        this.muteButton = this.game.add.button(10, 10, 'speaker', function muteGame()
        {
            {
                this.game.sound.mute = !this.game.sound.mute;
            }
        }, this, 2, 1, 0);
    },

    update: function()
    {
        speakerActive(this.game, this.muteButton);
    },
}

var menuReady = {
    create: function()
    {
        this._bg = this.game.add.tileSprite(0, 0, 800, 600, 'fondoReady');
        HudJS.StartCont.create(this.game);
    },

    update: function()
    {
        HudJS.StartCont.update();
    },
}

function createFinalMenu(game, music, nameMusic, volume, nameFondo)
{
    music = game.add.audio(nameMusic);
    music.volume = volume; 
    music.play();
    this._bg = game.add.tileSprite(0, 0, 800, 600, nameFondo);
    
    return music;
}

function backMenu()
{
    this.game.state.start('menu');
}

function speakerActive(game, button)
{
    if (!game.sound.mute)
        button.frame = 0;
    else
        button.frame = 1 ;
}

module.exports = { Menu, menuMuerte, menuVictoria, menuReady };

},{"./hud.js":5}],9:[function(require,module,exports){
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
},{"./herencia.js":4}],10:[function(require,module,exports){
'use strict';

var herenciaJS = require('./herencia.js')
var Player = require('./player.js')
var enemyJS = require('./enemy.js')
var Potion = require('./potions.js')
var PinkEnemy = require('./pinkEnemy.js');
var GreenEnemy = require('./greenEnemy.js');
var YellowEnemy = require('./yellowEnemy.js');
var Boss = require('./boss.js');
var HudJS = require('./hud.js');
var Map = require('./map.js');

var Objeto = herenciaJS.Objeto;
var ObjetoMovil = herenciaJS.ObjetoMovil;
var SerVivo = herenciaJS.SerVivo;
var Enemy = herenciaJS.Enemy;

// esto es pecaminoso e inmoral

var levels = ['level1', 'level2', 'level3', 'level4', 'levelBoss'];
var levelsJSON = ['level1JSON', 'level2JSON', 'level3JSON', 'level4JSON', 'levelBossJSON']
var numLevel = 0;
var secChar = false;

//Variables globales para controlar las pociones a lo largo de todos los niveles
var numPotions = 3;
var totalPotions = [];
var potionLevel1 = [];
var potionLevel2 = [];
const REDPOT_SPEEDUP = 200;
const BULLET_SPEED_PUP = 400;
const FRATE_PUP = 10;

var backMenu = false;

//Puntuaciones globales
var punt = [];

//Vidas globales
var vidas = [];

var PlayScene = {

    createButton: null,
    nextLevelButton: null,
    pauseButton: null,
    menuButton: null,
    speaker: null,
    muteButton: null,
    backMenu: null,


    music: null,
    bossMusic: null,
    player2Sound: null,

    pauseSprite: null,
    boss: null,

    create: function () {

        //Variables de los personajes
        this.game.playerGroup = this.game.add.group();
        this.potion = [];
        this.allDie = false;
        //Enemigos
        this.game.EnemyGroup = this.game.add.group();
        this.game.numEnemy = 0;
        //Variables de los inputs
        this.buttons();

        this.listenersPause();

        this.map = new Map(this.game, levels[numLevel], levelsJSON[numLevel], 'tiles-1', 'Map');
        HudJS.HUD.create(this.game, secChar, numLevel);

        this.createEnemy();
        this.key = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE);
        this.createPlayer(0, this.map._posPlayer[0].x, this.map._posPlayer[0].y, 'player1', Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.A, Phaser.Keyboard.W, Phaser.Keyboard.D, 20, 430)
        if (numLevel == 0 && !backMenu)
            Potion.Metodos.selectLevel(this.game, 0, totalPotions, numPotions, potionLevel1, numLevel, levels); 
        if (secChar)
            this.createPlayer(1, this.map._posPlayer[1].x, this.map._posPlayer[1].y, 'player2',  Phaser.Keyboard.ENTER, Phaser.Keyboard.LEFT, Phaser.Keyboard.UP, Phaser.Keyboard.RIGHT, 740, 430);
        
        if (numLevel == 4)
            this.game.Boss = new Boss(this.game, 625, 200, 'boss', -1, 70, this.map);
        
        this.createPotions();

        this.pauseSprite = this.game.add.sprite((this.game.width / 2) - 150, 200, 'fondoPause'); 
        this.pauseSprite.visible = false;

        this.createMusic();

        console.log(this.game.playerGroup);

    },

    update: function()
    {
        this.nextLevel();
        this.pauseGame();
        this.speakerActive();
        this.createSecondPlayer();

        for (var i = 0; i < this.game.playerGroup.children.length; i++)
        {    
            if(this.game.playerGroup.children[i]._vidas <= 0){
                this.game.playerGroup.children[i].kill()
                this.game.playerGroup.children[i].canShoot = false;
            }
            if(secChar){
               if(this.game.playerGroup.children[0]._vidas <= 0 && this.game.playerGroup.children[1]._vidas <= 0)
                    this.allDie = true;
            }
            else if(this.game.playerGroup.children[0]._vidas <= 0) 
                this.allDie = true;

        }
        if(this.allDie){
            this.removeMusic();
            backMenu = true;
            numLevel = 0;
            secChar = false;
            for (var i = 0; i < this.game.playerGroup.children.length; i++)
                totalPotions[i] = 0;
            this.game.state.start('estadoMuerte');
        }

        this.collisions();
        
        //HUD
        this.updateScores();

        console.log(this.game.numEnemy)
    },

    render: function()
    {  

    },

    collisions: function()
    {
        this.map.collisions();
    },



    //METODOS PARA LA CREACION DE LOS PERSONAJES
    createPlayer: function(num, x, y, name, fBut, left, up, right, livesX, livesY)
    {
        var pla = new Player(this.game, x, y, name, this.map._posPlayer[num].facing, 3, 'bullet', this.map);
        pla.setControllerKeys(fBut, left, up, right);
        
        this.game.playerGroup.children.push(pla);
        this.takePlayerVar(num);

        this.game.playerGroup.children[num].liveSprites(livesX, livesY);  

        if (num != 0 && !secChar) secChar = true;
    },

    createSecondPlayer: function()
    {
        if (this.game.playerGroup.children[1] == undefined && this.createButton.isDown)
        {
            this.createPlayer(1, this.map._posPlayer[1].x, this.map._posPlayer[1].y, 'player2',  Phaser.Keyboard.ENTER, Phaser.Keyboard.LEFT, Phaser.Keyboard.UP, Phaser.Keyboard.RIGHT, 740, 430);
            Potion.Metodos.selectLevel(this.game, 1, totalPotions, numPotions, potionLevel2, numLevel, levels); 
            this.playerPotion(potionLevel2, 1, 250, 100);
            this.player2Sound.play();
        }
    },



    //CREACION DE LOS ENEMIGOS
    createEnemy: function()
    {
        for (var i = 0; i < this.map._posEnemy.length; i++)
        {
            if (this.map._posEnemy[i].name == 'Pink')
                var enemy = new PinkEnemy(this.game, this.map._posEnemy[i].x, this.map._posEnemy[i].y, 'pink', this.map._posEnemy[i].facing, 3, this.map);
            else if (this.map._posEnemy[i].name == 'Green')
                var enemy = new GreenEnemy(this.game, this.map._posEnemy[i].x, this.map._posEnemy[i].y, 'green', this.map._posEnemy[i].facing, 3, 'fireBall', this.map);
            else if(this.map._posEnemy[i].name == 'Yellow')
                var enemy = new YellowEnemy(this.game, this.map._posEnemy[i].x, this.map._posEnemy[i].y, 'yellow', this.map._posEnemy[i].facing, 3, this.map);

            this.game.EnemyGroup.children.push(enemy);
        }
        this.game.numEnemy = this.game.EnemyGroup.children.length;
    },



    //METODOS PARA LA CREACION DE LAS POCIONES
    createPotions: function()
    {
        var x = 200;
        var y = 100;
        for (var i = 0; i < this.game.playerGroup.children.length; i++)
        {
            x = x + (i * 50);
            if (i == 0)
                this.playerPotion(potionLevel1, i, x, y);
            else
                this.playerPotion(potionLevel2, i, x, y);
        }
    },

    laBrujaPiruja: function(num, x, y)
    {
        this.potion[num] = new Potion.Potion(this.game, x, y, 'potion', this.map);
        this.potion[num].frame = totalPotions[num];
        totalPotions[num]++;
    },

    playerPotion: function(potionLevel, numPlayer, x, y)
    {
        if (Potion.Metodos.createPotions(potionLevel, numLevel)) 
            this.laBrujaPiruja(numPlayer, x, y);
    },



    //PASO DE NIVELES
    nextLevel: function()
    {
        if (numLevel < levels.length - 1 && (this.game.numEnemy == 0 || this.nextLevelButton.isDown))
        {
            numLevel++;
            this.removeMusic();
            this.setVidas();
            this.game.state.start('estadoReady');
        }
        else if (numLevel == levels.length - 1 && this.game.Boss._vidas <= 0 && this.game.numEnemy == 0)
        {
            console.log(numLevel)
            numLevel = 0;
            this.removeMusic();
            this.game.state.start('estadoVictoria');
        }
    },



    //PAUSA
    pauseGame: function()
    {
        if(this.pauseButton.isDown)
        {
            this.game.paused = true;
            this.pauseSprite.visible = true;
        }
    },

    listenersPause: function()
    {
        this.pauseButton.onDown.add(function () {
            if(this.game.paused)
            {
                this.game.paused = false
                this.pauseSprite.visible = false;
            };
        },this);

        this.menuButton.onDown.add(function () {
            if(this.game.paused)
            {
                backMenu = true;
                this.game.paused = false;
                this.pauseSprite.visible = false;
                this.removeMusic();
                numLevel = 0;
                for (var i = 0; i < this.game.playerGroup.children.length; i++)
                    totalPotions[i] = 0;
                secChar = false;
                this.game.state.start('menu');
            };
        },this);
    },



    //METODOS PARA LAS SCORES
    updateScores: function()
    {
        for (var i = 0; i < this.game.playerGroup.children.length; i++)
            punt[i] = this.game.playerGroup.children[i].score;
        HudJS.HUD.update(secChar, punt);
    },

    takePlayerVar: function(num)
    {
        if ((punt[num] || vidas[num]) != undefined && numLevel != 0)
        {
            this.game.playerGroup.children[num].score += punt[num];
            this.game.playerGroup.children[num]._vidas = vidas[num];
        }
        else if ((punt[num] || vidas[num]) == undefined || numLevel == 0)
        {
            this.game.playerGroup.children[num].score = 0;
            this.game.playerGroup.children[num]._vidas = 3;
        }

        if (totalPotions[num] == 1 || totalPotions[num] == 2 || totalPotions[num] == 3)
        {
                this.game.playerGroup.children[num].velocity = REDPOT_SPEEDUP;
            if (totalPotions[num] == 2 || totalPotions[num] == 3)
            {
                this.game.playerGroup.children[num].playerWeapon.changeBulletSpeed(BULLET_SPEED_PUP);
                
                if (totalPotions[num] == 3)
                    this.game.playerGroup.children[num].playerWeapon.changeFireRate(FRATE_PUP);
            }
        }
    },

    setVidas: function()
    {
        for(var i = 0; i < this.game.playerGroup.children.length; i++)
        {
            vidas[i] = this.game.playerGroup.children[i]._vidas;
        }
    },

    buttons: function()
    {
        this.createButton = this.game.input.keyboard.addKey(Phaser.Keyboard.TWO);
        this.nextLevelButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE);
        this.pauseButton = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
        this.menuButton = this.game.input.keyboard.addKey(Phaser.Keyboard.M);
    },


    
    //CONTROL DE LA MUSICA
    createMusic: function()
    {
        this.muteButton = this.game.add.button(10, 10, 'speaker', function muteGame()
        {
            this.game.sound.mute = ! this.game.sound.mute;
        }, this, 2, 1, 0);
        this.music = this.game.add.audio('gameMusic');
        this.bossMusic = this.game.add.audio('bossMusic');
        this.player2Sound = this.game.add.audio('createPlayer2');
        this.player2Sound.volume = 0.2;
        if(numLevel != 4)
            this.music.loopFull(1);
        else
            this.bossMusic.loopFull(1);
    },

    removeMusic: function()
    {
        this.music.destroy();
        this.bossMusic.destroy();
    },

    speakerActive: function()
    {
        if (!this.game.sound.mute)
            this.muteButton.frame = 0;
        else
            this.muteButton.frame = 1 ;
    },
};

module.exports = PlayScene;

},{"./boss.js":1,"./enemy.js":2,"./greenEnemy.js":3,"./herencia.js":4,"./hud.js":5,"./map.js":7,"./pinkEnemy.js":9,"./player.js":11,"./potions.js":12,"./yellowEnemy.js":13}],11:[function(require,module,exports){
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
},{"./herencia.js":4}],12:[function(require,module,exports){
var herenciaJS = require('./herencia.js')

var Objeto = herenciaJS.Objeto;

const REDPOT_SPEEDUP = 200;
const BULLET_SPEED_PUP = 400;
const FRATE_PUP = 10;

var Potion = function(juego, x, y, sprite, map)
{
    this.map = map;
    Objeto.call(this, juego, x, y, sprite);

    this.body.setSize(23, 35, 5, 0);
    this.body.immovable = true;
    this._sound = this.game.add.audio('pickPotion');
}
Potion.prototype = Object.create(Objeto.prototype);
Potion.prototype.constructor = Potion;

Potion.prototype.update = function()
{
    this.collision();
}

Potion.prototype.collision = function()
{
    this.game.physics.arcade.collide(this, this.map._layer);
    this.game.physics.arcade.collide(this, this.game.playerGroup.children,
    function collisionHandler(pot, pla)
    {
        pot._sound.play();
        if (pot.frame == 0)
            pla.velocity = REDPOT_SPEEDUP;
        else if (pot.frame == 1)
            pla.playerWeapon.changeBulletSpeed(BULLET_SPEED_PUP);
        else if (pot.frame == 2)
            pla.playerWeapon.changeFireRate(FRATE_PUP);
            
        pot.kill();
    },
    null, this);
};

var Metodos =
{
    createPotions: function(potionLevel, numLevel)
    {        
        var i = 0;
        var created = false;
        while (i < potionLevel.length && !created)
        {
            if (numLevel === potionLevel[i])
                created = true;
            else i++;
        }
        return created;
    },

    selectLevel: function(game, numPlayer, totalPotions, numPotions, potionLevel, numLevel, levels)
    {
        totalPotions[numPlayer] = 0;

        var i = 0;
        var maxPotions = false;
        while (i < numPotions && !maxPotions)
        {
            potionLevel[i] = game.rnd.integerInRange(numLevel, levels.length - 1);
            if(!this.repeatRandom(potionLevel[i], potionLevel))
            {
                if (potionLevel.length == (levels.length - numLevel))
                    maxPotions = true;
                else i++;
            }
        }
    },

    repeatRandom: function (num, array)
    {
        var i = 0;
        var encontrado = false;
        while (i < array.length - 1 && !encontrado)
        {
            if(num == array[i]) encontrado = true;
            else i++;
        }

        return (encontrado);
    }
};

module.exports = {Potion, Metodos};
},{"./herencia.js":4}],13:[function(require,module,exports){
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
},{"./herencia.js":4}]},{},[6]);
