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