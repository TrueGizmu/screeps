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
    run: function (creep) {
        switch (creep.memory.whatToDo) {
            case 'load':
                if (_.sum(creep.carry) == creep.carryCapacity) {
                    common.changeState(creep, 'unload');
                    break;
                }

                // find the nearest tombstone containing resources
                var tombstone = creep.pos.findClosestByRange(FIND_TOMBSTONES, { filter: x => _.sum(x.store) > 0 });
                if (tombstone) {
                    if (!creep.pos.isNearTo(tombstone)) {
                        // try to reach tombstone
                        creep.moveTo(tombstone);
                    }
                    else {
                        // withdraw all resource types
                        for (var prop in tombstone.store) {
                            creep.withdraw(tombstone, prop);
                        }
                    }
                    return;
                }
                
                /*var target2 = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
                if(target2) {
                    if(creep.pickup(target2) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target2);
                    }
                    return;
                }*/

                var container = _.find(creep.room.memory.containers, c => c.readyToTransfer);
                if (container) {
                    container = Game.getObjectById(container.id);
                    if (container && !container.isEmpty) {
                        if (!creep.pos.isNearTo(container)) {
                            creep.moveTo(container);
                        }
                        else {
                            // withdraw all resource types
                            for (var prop in container.store) {
                                creep.withdraw(container, prop);
                            }
                        }
                        return;
                    }
                }

                if (!common.gather(creep)) {
                    var flag = Game.flags.GatherPoint;
                    if (flag && flag.room.name == creep.room.name) {
                        creep.moveTo(flag, { visualizePathStyle: { stroke: '#059121', opacity: 0.8 } });
                    }
                }
                break;
            case 'unload':
                if (_.sum(creep.carry) == 0) {
                    common.changeState(creep, 'load');
                    break;
                }

                let target;
                if (_.sum(creep.carry) > creep.carry.energy) {

                    target = common.storeMinerals(creep);
                }
                else {
                    target = common.storeEnergy(creep);
                }

                if (!target) {
                    var flag = Game.flags.GatherPoint;
                    if (flag && flag.room.name == creep.room.name) {
                        creep.moveTo(flag, { visualizePathStyle: { stroke: '#059121', opacity: 0.8 } });
                    }
                }
                break;
            default:
                creep.memory.whatToDo = 'load';

        }
    }
};