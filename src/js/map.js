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