/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.zerg');
 * mod.thing == 'a thing'; // true
 */
var common = require("common");

function _changeState(creep, nextState) {
    console.log(`Changing creep ${creep.name} state to ${nextState}`);
    creep.memory.whatToDo = nextState;
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
                        _changeState(creep, 'claimController');
                    }
                    else {
                        _changeState(creep, 'dismantleHostileSpawn');
                    }
                    break;
                }

                var flag = Game.flags[creep.memory.signPostNames[0]];

                creep.moveTo(flag, { visualizePathStyle: { stroke: '#ffaa00' } });

                if (creep.pos.isEqualTo(flag)) {
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
                    creep.suicide();
                }
                break;
            case 'dismantleHostileSpawn':
                var spawnToDismantle = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
                if (!spawnToDismantle) {
                    _changeState(creep, 'buildSpawnConstructionSite');
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
            case 'buildSpawnConstructionSite':
                var warFlag = Game.flags['Warflag'];
                creep.room.createConstructionSite(warFlag.pos.x, warFlag.pos.y, STRUCTURE_SPAWN, warFlag.memory.spawnName);
                _changeState(creep, 'work');
                break;
            case 'work':
                if (!creep.memory.mining && creep.carry.energy == 0) {
                    creep.memory.mining = true;
                    creep.say('kop kop');
                }
                if (creep.memory.mining && creep.carry.energy == creep.carryCapacity) {
                    creep.memory.mining = false;
                    creep.say('work work');
                }

                if (creep.memory.mining) {
                    var source = creep.pos.findClosestByPath(FIND_SOURCES, { filter: (str) => { return str.energy >= creep.carryCapacity; } });
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
                else {
                    if (common.storeEnergy(creep)) {
                        return;
                    }

                    var target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
                    if (target) {
                        creep.say("Buduj raz");
                        if (creep.build(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, { visualizePathStyle: { stroke: '#317ef9', opacity: 0.8 } });
                        }
                        return;
                    }

                    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                }
                break;
            default:
                _changeState(creep, 'goToRoom');
                break;
        }
    }
};