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
