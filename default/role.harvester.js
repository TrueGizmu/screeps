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
            creep.say('⛏ kop kop');
	    }
	    if(!creep.memory.loading && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.loading = true;
	        creep.say('⚡ zaap');
	    }
        
	    if(!creep.memory.loading) {
	        // find the nearest tombstone containing resources
            var tombstone = creep.pos.findClosestByRange(FIND_TOMBSTONES, { filter: x => _.sum(x.store) > 0 });
            if (tombstone) {
                if (!creep.pos.isNearTo(tombstone)) {
                    // try to reach tombstone
                    creep.moveTo(tombstone);
                }
                else
                {
                    // withdraw all resource types
                    for (var prop in tombstone.store) {
                        creep.withdraw(tombstone, prop);
                    }
                }
            }
            else {
                common.gather(creep);
            }
        }
        else {
            if (_.sum(creep.carry) > creep.carry.energy) {
                
                common.storeMinerals(creep);
            }
            else {
                common.storeEnergy(creep);
            }
        }
	}
};