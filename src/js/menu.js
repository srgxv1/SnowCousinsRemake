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
