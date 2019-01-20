/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('notatnik');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    Game.spawns.SpawnGizmu.spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'GLS', { memory: { role: 'speditor', sourceId: '5c3a970951bc344651daf0e6' , targetId:'5c329901cd8d3949df924bb5'} });

    Game.spawns.SpawnRyjek.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'ZergQueen', { memory: { role: 'zerg', whatToDo: 'work', roomName: 'E43N29'} });


    Game.spawns.SpawnGizmu.spawnCreep([MOVE], 'Legolas');
Game.creeps.Legolas.moveTo(Game.flags.Flag1);

//Game.creeps.Gimli.moveTo(49,16);
    if (Game.creeps.Gimli.room.name == 'E43N29') {
        if(Game.creeps.Gimli.claimController(Game.creeps.Gimli.room.controller) == ERR_NOT_IN_RANGE) {
                Game.creeps.Gimli.moveTo(Game.creeps.Gimli.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
    }
}