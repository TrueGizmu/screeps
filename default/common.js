/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('common');
 * mod.thing == 'a thing'; // true
 */

module.exports = { 
    clearMemory() {
        for(var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    },
    
    gather(creep, position) {
        if (!position) {
            position = creep.pos;
        }

        var energyNeeded = creep.carryCapacity - _.sum(creep.carry);
        
        var containers = _.filter(creep.room.getContainers(), c => c.store[RESOURCE_ENERGY] >= energyNeeded);
        if (creep.memory.role == 'upgrader') {
            var outLinks = _.filter(creep.room.getLinks('OUT'), l => l.energy >= energyNeeded);
            containers = containers.concat(outLinks);
        }

	    if (containers.length > 0) {
	        var source = position.findClosestByRange(containers);
	        if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
	    else if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >= energyNeeded) {
	        var source = creep.room.storage;
	        if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
    },
    
    storeEnergy(creep) {
      var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
              filter: (structure) => {
                  return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                      structure.energy < structure.energyCapacity && creep.memory.roomName == structure.room.name;
              }
      });

      if (!target) {
          var towers = creep.room.getTowers();
          target = creep.pos.findClosestByRange(_.filter(towers, t => t.energy < (t.energyCapacity/2)));
      }

      if(!target) {
          target = creep.pos.findClosestByRange(_.filter(creep.room.getLinks('IN'), l => l.energy != l.energyCapacity));
      }
      
      if (target) {
          if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
          }
      }
      else if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] < 700000 && _.sum(creep.room.storage.store) != creep.room.storage.storeCapacity) {
          target = creep.room.storage;
          if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
          }
      }
      
      return target;
    },
    
    storeMinerals(creep) {
        if (creep.room.storage && _.sum(creep.room.storage.store) != creep.room.storage.storeCapacity) {
            target = creep.room.storage;
            for(var item in creep.carry) {
                if(creep.transfer(target, item) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }  
    },
    
    linksTransfer(room) {
        var allInLinks = room.getLinks('IN');
        var allOutLinks = room.getLinks('OUT');
        
        for (var i in allInLinks) {
            for (var o in allOutLinks) {
                if (allInLinks[i].transferEnergy(allOutLinks[o]) == OK) {
                    break;
                }
            }
        }
    },
};