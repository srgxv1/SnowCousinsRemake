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
