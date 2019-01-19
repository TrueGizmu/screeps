/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('defences');
 * mod.thing == 'a thing'; // true
 */
var utilsStats = require('utils.stats');

module.exports = {
    run(room) {
        var towers = room.getTowers();

        if (!towers) return;

        var hostiles = room.find(FIND_HOSTILE_CREEPS);
        utilsStats.setHostiles(hostiles.length, room.name);

        towers.forEach(tower => {
            var closestHostile = tower.pos.findClosestByRange(hostiles);
            if (closestHostile) {
                tower.attack(closestHostile);
            }
            else if (tower.energy > 200) {
                var damagedStructures = _sortBy(creep.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL
                }), x=>x.hits);

                var closestDamagedStructure = tower.pos.findClosestByRange(damagedStructures);
                if (closestDamagedStructure) {
                    tower.repair(closestDamagedStructure);
                }
            }
            return;
        });
    }
};