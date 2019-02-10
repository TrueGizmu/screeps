/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.zerg');
 * mod.thing == 'a thing'; // true
 */
var common = require("common");

function _work(creep) {
    if (!creep.memory.mining && creep.carry.energy == 0) {
        creep.memory.mining = true;
        creep.say('kop kop');
    }
    if (creep.memory.mining && creep.carry.energy == creep.carryCapacity) {
        creep.memory.mining = false;
        creep.say('work work');
    }

    if (creep.memory.mining) {
        var hostileStruct = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: f => f.energy || (f.store && f.store.energy) });

        if (hostileStruct) {
            if (creep.withdraw(hostileStruct, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(hostileStruct, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
            return;
        }

        var source = creep.pos.findClosestByPath(FIND_SOURCES, { filter: (str) => { return str.energy >= creep.carryCapacity; } });
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    }
    else {
        var target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if (target) {
            creep.say("😀");
            if (creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: { stroke: '#317ef9', opacity: 0.8 } });
            }
            return;
        }

        if (common.storeEnergy(creep)) {
            return;
        }

        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
            return;
        }
    }
}

module.exports = {
    run(creep) {
        switch (creep.memory.whatToDo) {
            case 'goToRoom':
                if (!creep.memory.signPostNames) {
                    var signPosts = _.filter(Game.flags, f => f.name.startsWith('SignPost'));
                    if (signPosts) {
                        signPosts = _.sortBy(signPosts, 'name').map(s => s.name);
                    }
                    signPosts.push('Warflag');
                    creep.memory.signPostNames = signPosts;
                }

                if (creep.room.name == creep.memory.roomName) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
                    if (creep.getActiveBodyparts(CLAIM) > 0) {
                        common.changeState(creep, 'claimController', true);
                    }
                    else {
                        common.changeState(creep, 'dismantleHostileSpawn', true);
                    }
                    break;
                }

                var flag = Game.flags[creep.memory.signPostNames[0]];

                creep.moveTo(flag, { visualizePathStyle: { stroke: '#ffaa00' } });

                if (creep.pos.isEqualTo(flag)) {
                    console.log(`${creep.name} is passing ${flag.name}`);
                    creep.memory.signPostNames.shift();
                }
                break;
            case 'claimController':
                var claimResult = creep.claimController(creep.room.controller);
                if (claimResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                else if (claimResult == OK) {
                    creep.signController(creep.room.controller, "Gizmu's dominion!");
                    console.log(`Room ${creep.room.name} claimed, creep can die now`);
                    creep.room.mapInMemory();
                    creep.suicide();
                }
                break;
            case 'dismantleHostileSpawn':
                var spawnToDismantle = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
                if (!spawnToDismantle) {
                    common.changeState(creep, 'clearSpawnLocation', true);
                    break;
                }

                if (spawnToDismantle.energy > 0 && _.sum(creep.carry) < creep.carryCapacity) {
                    if (creep.withdraw(spawnToDismantle, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(spawnToDismantle, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }

                if (creep.dismantle(spawnToDismantle) != OK) {
                    creep.say("seek & destroy");
                    creep.moveTo(spawnToDismantle, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                break;
            case 'clearSpawnLocation':
                var warFlag = Game.flags['Warflag'];
                var target = _.find(warFlag.pos.lookFor(LOOK_STRUCTURES), x => !x.my);
                if (!target) {
                    common.changeState(creep, 'buildSpawnConstructionSite', true);
                    break;
                }

                if (creep.dismantle(target) != OK) {
                    creep.say("seek & destroy");
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000', opacity: 0.8 } });
                }
                break;
            case 'buildSpawnConstructionSite':
                var warFlag = Game.flags['Warflag'];
                creep.room.createConstructionSite(warFlag.pos.x, warFlag.pos.y, STRUCTURE_SPAWN, warFlag.memory.spawnName);
                common.changeState(creep, 'buildSpawn', true);
                break;
            case 'buildSpawn':
                var warFlag = Game.flags['Warflag'];
                if (Game.spawns[warFlag.memory.spawnName]) {
                    common.changeState(creep, 'dismantleHostileStructures', true);
                    break;
                }
                _work(creep);
                break;
            case 'dismantleHostileStructures':
                var itemToDismantle = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: x => !x.energy && (!x.store || _.sum(x.store) == 0)});
                if (!itemToDismantle) {
                    common.changeState(creep, 'work', true);
                    break;
                }

                if (creep.dismantle(itemToDismantle) != OK) {
                    creep.say("seek & destroy");
                    creep.moveTo(itemToDismantle, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                break;
            case 'work':
                _work(creep);
                break;
            default:
                common.changeState(creep, 'goToRoom', true);
                break;
        }
    }
};