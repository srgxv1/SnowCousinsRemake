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

