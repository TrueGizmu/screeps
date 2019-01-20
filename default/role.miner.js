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

        if (!creep.memory.containerId || !creep.memory.sourceId) {
            var containers = creep.room.memory.containers;

            var target = _.find(containers, s => s.isActive && _.every(Game.creeps, c=>c.memory.containerId != s.id));
            if (target) {
                creep.memory.containerId = target.id;
                creep.memory.sourceId = target.sourceId;
            }
            else {
                console.log('Miner', creep.name, 'cannot find assignement');
                creep.say('boooriingg');
            }
        }
        else {
            var container = Game.getObjectById(creep.memory.containerId);
            var source = Game.getObjectById(creep.memory.sourceId);
            if (!container.memory || container.memory.isActive) {
                if (!creep.pos.isEqualTo(container)) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                    return;
                }

                if (!container.isFull) {
                    creep.harvest(source);
                }
                
                if (container.memory && container.memory.type == LOOK_MINERALS) {
                    var containerStoreAmount = _.sum(container.store);
                    
                    if(containerStoreAmount <= 500) {
                        container.memory.readyToTransfer = false;
                    }
                    else if(containerStoreAmount >= 1500) {
                        container.memory.readyToTransfer = true;
                    }
                    
                    if(container.isFull || source.ticksToRegeneration) {
                        container.memory.isActive = false;
                        creep.memory.containerId = null;
                        creep.memory.sourceId = null;
                    }
                }
            }
        }
	}
};