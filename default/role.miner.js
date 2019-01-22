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
            default:
            case 'assign':
                if (creep.memory.containerId && creep.memory.sourceId) {
                    common.changeState(creep, 'work');
                    break;
                }
                //assign to the source
                var containers = creep.room.memory.containers;
                var miners = creep.room.memory.miners;

                var target = _.find(miners, m => m.name == creep.name);
                if (target) {
                    target.name = creep.name;
                    creep.memory.containerId = target.containerId;
                    creep.memory.sourceId = target.sourceId;
                    creep.memory.linkId = target.linkId;
                    if (target.sourceType == LOOK_ENERGY) {
                        creep.memory.sourceType = RESOURCE_ENERGY;
                    }
                    else {
                        creep.memory.sourceType = Game.getObjectById(target.sourceId).mineralType;
                    }
                    common.changeState(creep, 'work');
                    console.log(`Miner ${creep.name} assigned, memory: ${JSON.stringify(creep.memory)}`);
                }
                else {
                    var target = _.find(containers, s => s.isActive && _.every(Game.creeps, c => c.memory.containerId != s.id));
                    if (target) {
                        creep.memory.containerId = target.id;
                        creep.memory.sourceId = target.sourceId;
                        common.changeState(creep, 'work');
                    }
                    else {
                        console.log('Miner', creep.name, 'cannot find assignement');
                        creep.say('Boooriingg');
                    }
                }
                break;
            case 'work':
                if (creep.ticksToLive < 3) {
                    common.changeState(creep, 'unassign');
                }

                var container = Game.getObjectById(creep.memory.containerId);
                var source = Game.getObjectById(creep.memory.sourceId);
                var link = Game.getObjectById(creep.memory.linkId);

                if (container.isFull && (!link || link.IsFull)) {
                    console.log('Miner: Everything is full');
                    break;
                }

                if (!creep.pos.isEqualTo(container)) {
                    creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' } });
                    return;
                }

                var miner = _.find(creep.room.memory.miners, m => m.name == creep.name);
                if (miner) {
                    if (creep.harvest(source) != OK) {
                        break;
                    }

                    let target;
                    if (_.some(creep.body, x => x.type == CARRY)) {
                        switch (miner.strategy) {
                            default:
                            case 'fiftyFifty':
                                if ((!creep.memory.lastTargetId || creep.memory.lastTargetId != container.id) && !container.isFull) {
                                    target = container;
                                    creep.memory.lastTargetId = container.id;
                                }
                                else if (link) {
                                    target = link;
                                    creep.memory.lastTargetId = link.id;
                                }
                                break;
                            case 'linkFirst':
                                if (link && !link.isFull) {
                                    target = link;
                                }
                                else {
                                    target = container;
                                }
                                break;
                            case 'containerFirst':
                                if (!container.isFull) {
                                    target = container;
                                }
                                else {
                                    target = link;
                                }
                                break;
                        }

                        if (target) {
                            creep.transfer(target, creep.memory.sourceType);
                        }
                    }
                }

                if (!container.memory || container.memory.isActive) {
                    if (!container.isFull) {
                        creep.harvest(source);
                    }

                    if (container.memory && container.memory.type == LOOK_MINERALS) {
                        var containerStoreAmount = _.sum(container.store);

                        if (containerStoreAmount <= 500) {
                            container.memory.readyToTransfer = false;
                        }
                        else if (containerStoreAmount >= 1500) {
                            container.memory.readyToTransfer = true;
                        }

                        if (container.isFull || source.ticksToRegeneration) {
                            container.memory.isActive = false;
                            common.changeState(creep, 'unassign');
                        }
                    }
                }
                break;
            case 'unassign':
                var miner = _.find(creep.room.memory.miners, m => m.name == creep.name);
                if (miner) {
                    miner.name = null;
                    creep.memory.containerId = null;
                    creep.memory.sourceId = null;
                    creep.memory.linkId = null;
                    console.log(`Miner ${creep.name} unassigned and waiting for death!`);
                }
                break;
        }
    }
};