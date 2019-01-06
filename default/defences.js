/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('defences');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run(room) {
        var towers = room.getTowers();
        
        if (!towers) return;
        
        towers.forEach( tower => {
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                var username = closestHostile.owner.username;
                console.log(`User ${username} spotted in room ${room.name}`);
                Game.notify(`User ${username} spotted in room ${room.name}`);
                tower.attack(closestHostile);
            }
            
            if (tower.energy > 200) {
                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: structure => structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL
                });
                if (closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }
            }
            return;
        });
    }
};