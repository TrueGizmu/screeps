/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */
 
var common = require('common');

module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.loading && _.sum(creep.carry) == 0) {
            creep.memory.loading = false;
            creep.say('kop kop');
	    }
	    if(!creep.memory.loading && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.loading = true;
	        creep.say('zaap');
	    }
        
	    if(!creep.memory.loading) {            
            var storage = creep.room.storage;
            if (storage && _.sum(storage.store) != storage.storeCapacity) {
                if (!creep.pos.isNearTo(storage)) {
                    creep.moveTo(storage);
                }
                else {
                    // withdraw all resource types
                    for (var prop in storage.store) {
                        creep.withdraw(storage, prop);
                    }
                }
                return;
            }
        }
        else {
            let target;
            if (_.sum(creep.carry) > creep.carry.energy) {
                
                target = common.storeMinerals(creep);
            }
            else {
                target = common.storeEnergy(creep);
            }

            if (!target) {
                creep.say('Booriingg');
                creep.moveTo(Game.getObjectById(creep.room.memory.spawns[0].id));
            }
        }
	}
};