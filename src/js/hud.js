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