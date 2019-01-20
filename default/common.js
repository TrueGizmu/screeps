/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('common');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    changeState(creep, nextState) {
        console.log(`Changing creep ${creep.name} state to ${nextState}`);
        creep.memory.whatToDo = nextState;
    },

    checkWarflagIfReady(warflag) {
        if (!warflag) return false;

        if (!warflag.memory) return false;

        return warflag.memory.isReady == true;
    },

    getWarflag() {
        var warflag = Game.flags['Warflag'];

        if (!this.checkWarflagIfReady(warflag)) {
            return undefined;
        }

        return warflag;
    },

    clearMemory() {
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }

        for (var name in Memory.rooms) {
            if (!Game.rooms[name]) {
                delete Memory.rooms[name];
                console.log('Clearing non-existing room memory:', name);
            }
        }
    },

    gather(creep, position) {
        if (!position) {
            position = creep.pos;
        }

        var energyNeeded = creep.carryCapacity - _.sum(creep.carry);

        var containers = _.filter(creep.room.getContainers(), c => c.store[RESOURCE_ENERGY] >= energyNeeded);
        let storage;
        if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >= energyNeeded) {
            storage = creep.room.storage;
        }

        let terminal;
        if (creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] >= energyNeeded) {
            terminal = creep.room.terminal;
        }

        let sources;

        switch (creep.memory.role) {
            case 'upgrader':
                var outLinks = _.filter(creep.room.getLinks('OUT'), l => l.energy >= energyNeeded);
                sources = containers.concat(outLinks).concat(storage);
                break;
            case 'harvester':
                sources = containers;
                if (sources.length == 0 && storage) {
                    sources = sources.concat(storage);
                }
                if (sources.length == 0 && terminal) {
                    sources = sources.concat(terminal);
                }
                break;
            default:
                sources = containers.concat(storage);
                break;
        }

        var source = position.findClosestByRange(sources);
        if (source) {
            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#f4ee42' } });
            }
        }

        return source;
    },

    storeEnergy(creep) {
        var target = undefined;

        if (creep.room.energyAvailable < Math.min(creep.room.energyCapacityAvailable * 0.85, 1000)) {

            target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.energy < structure.energyCapacity && creep.memory.roomName == structure.room.name;
                }
            });
        }

        if (!target) {
            var towers = creep.room.getTowers();
            target = creep.pos.findClosestByRange(_.filter(towers, t => t.energy < (t.energyCapacity * 2 / 3)));
        }

        if (!target) {
            target = creep.pos.findClosestByRange(_.filter(creep.room.getLinks('IN'), l => l.energy != l.energyCapacity));
        }

        if (!target && creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
            target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.energy < structure.energyCapacity && creep.memory.roomName == structure.room.name;
                }
            });
        }

        if (!target) {
            if (creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] < 100000 && _.sum(creep.room.terminal.store) != creep.room.terminal.storeCapacity) {
                target = creep.room.terminal;
            }
        }

        if (!target) {
            if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] < 700000 && _.sum(creep.room.storage.store) != creep.room.storage.storeCapacity) {
                target = creep.room.storage;
            }
        }

        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#41ebf4' } });
            }
        }

        return target;
    },

    storeMinerals(creep) {
        let target;
        if (creep.room.terminal && _.sum(creep.room.terminal.store) != creep.room.terminal.storeCapacity) {
            target = creep.room.terminal;
        }

        if (!target && creep.room.storage && _.sum(creep.room.storage.store) != creep.room.storage.storeCapacity) {
            target = creep.room.storage;
        }

        if (target) {
            for (var item in creep.carry) {
                if (creep.transfer(target, item) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
        return target;
    },

    linksTransfer(room) {
        var allInLinks = room.getLinks('IN');
        var allOutLinks = room.getLinks('OUT');

        for (var i in allInLinks) {
            for (var o in allOutLinks) {
                if (allOutLinks[o].energy < 799 && allInLinks[i].transferEnergy(allOutLinks[o]) == OK) {
                    break;
                }
            }
        }
    },
};