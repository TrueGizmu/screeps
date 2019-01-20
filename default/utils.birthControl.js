/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawning');
 * mod.thing == 'a thing'; // true
 */

var common = require('common');

module.exports = {

    spawn: function (room) {
        //if there is no containers do not spawn - zerg tiimeee!
        if (!room.getContainers().length) return;

        //move it later
        var warFlag = common.getWarflag();
        if (warFlag && warFlag.pos.roomName == room.name) {
            //warFlag in a room with container - removing, room can live by its own now - zergs off
            console.log(`${warFlag.pos.roomName}: disabling ${warFlag.name}`);
            warFlag.memory.isReady = false;
        }

        var spawn = _.find(room.getSpawns(), s => !s.spawning);
        if (!spawn) return;

        var harvesters = _.filter(Game.creeps, creep => creep.memory.role == 'harvester' && creep.memory.roomName == room.name);
        var upgraders = _.filter(Game.creeps, creep => creep.memory.role == 'upgrader' && creep.memory.roomName == room.name);
        var builders = _.filter(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.roomName == room.name);
        var miners = _.filter(Game.creeps, creep => creep.memory.role == 'miner' && creep.memory.roomName == room.name);
        var zergClaimer = _.filter(Game.creeps, creep => creep.name == 'ZergClaimer');
        var zergs = _.filter(Game.creeps, creep => creep.memory.role == 'zerg' && creep.name != 'ZergClaimer');
        var clickers = _.filter(Game.creeps, creep => creep.memory.role == 'clicker');


        var constructionSites = room.find(FIND_CONSTRUCTION_SITES);

        if (Game.time % 50 == 0) {
            console.log('Room:', room.memory.alias, ' Harvesters: ', harvesters.length, ' Upgraders: ', upgraders.length, ' Builders: ', builders.length,
                ' Miners:', miners.length, ' Zergs:', zergs.length);
        }

        if (room.energyAvailable >= 750) {
            //---------MINERS-------------------
            if (miners.length < _.filter(room.memory.containers, c => c.isActive).length) {
                spawn.spawnCreep([WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE], { memory: { role: 'miner', roomName: room.name } });
                return;
            }

            //---------HARVESTERS-------------------
            if (harvesters.length < 3) {
                spawn.spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], { memory: { role: 'harvester', roomName: room.name } });
                return;
            }

            //---------UPGRADERS-------------------
            if (upgraders.length == 0 || (constructionSites.length == 0 && upgraders.length < 3)) {
                if (!room.storage || (room.storage && room.storage.store[RESOURCE_ENERGY] >= 100000) || upgraders.length < 2) {
                    var body = [];
                    if (_.some(room.memory.links)) {
                        body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
                    }
                    else {
                        body = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
                    }
                    if (room.name != 'E43N29' || (room.name == 'E43N29' && upgraders.length == 0)) {
                        spawn.spawnCreep(body, { memory: { role: 'upgrader', roomName: room.name } });
                        return;
                    }
                }
            }

            //---------BUILDERS-------------------
            if (constructionSites.length > 0 && builders.length < 2) {
                spawn.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], { memory: { role: 'builder', roomName: room.name } });
                return;
            }

            //---------ZERGZZ-------------------
            if (warFlag && warFlag.memory.originRoomName == room.name) {
                if (zergClaimer.length == 0 && (!warFlag.room || !warFlag.room.controller.my)) {
                    spawn.spawnCreep([CLAIM, MOVE, MOVE, MOVE], 'ZergClaimer', { memory: { role: 'zerg', roomName: warFlag.pos.roomName } });
                    return;
                }

                if (zergs.length < 4 || (zergs.length < 5 && _.some(zergs, z => z.ticksToLive < 300))) {
                    spawn.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], { memory: { role: 'zerg', roomName: warFlag.pos.roomName } });
                    return;
                }
            }

            if (clickers.length < _.filter(Game.flags, f => f.color == COLOR_PURPLE).length) {
                spawn.spawnCreep([CLAIM, MOVE], { memory: { role: 'clicker' } });
                return;
            }
        }
        else if (spawn.room.energyAvailable >= 300) {
            if (miners.length < _.filter(room.memory.containers, c => c.isActive).length) {
                spawn.spawnCreep([WORK, WORK, MOVE, MOVE], { memory: { role: 'miner', roomName: room.name } });
                return;
            }

            if (harvesters.length < 1) {
                spawn.spawnCreep([CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], { memory: { role: 'harvester', roomName: room.name } });
                return;
            }
        }
    }
};