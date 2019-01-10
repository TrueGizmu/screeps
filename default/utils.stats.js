/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('stats');
 * mod.thing == 'a thing'; // true
 */

function _generateRooms() {
    var rooms = {};
    for (var roomName in Game.rooms) {
        var x = Game.rooms[roomName];
        if (!x.memory || !x.memory.alias) continue;

        rooms[x.memory.alias] = {
            energyAvailable: x.energyAvailable,
            energyCapacityAvailable: x.energyCapacityAvailable,
            controller: {
                level: x.controller.level,
                progress: x.controller.progress,
                progressTotal: x.controller.progressTotal,
                percentage: (x.controller.progress / x.controller.progressTotal * 100).toFixed(2),
                decimalLevel: (x.controller.level + (x.controller.progress / x.controller.progressTotal)).toFixed(2)
            },
            storage: x.storage ? x.storage.store : null,
            terminal: x.terminal ? x.terminal.store : null,
            roles: _(Game.creeps).filter(c => c.memory.roomName == x.name).countBy(c => c.memory.role).value()
        }
    }

    return rooms;
}

module.exports = {

    gather: function () {

        if (Memory.cpu.length > 50) {
            Memory.cpu.shift();
        }

        Memory.cpu.push(Game.cpu.getUsed());

        if (Game.time % 20 == 0) {

            Memory.stats = {
                cpu: {
                    percentUsage: (_.sum(Memory.cpu) / Memory.cpu.length / Game.cpu.limit * 100).toFixed(2),
                    available: Game.cpu.tickLimit,
                    bucket: Game.cpu.bucket
                },
                gcl: {
                    level: Game.gcl.level,
                    progress: Math.round(Game.gcl.progress),
                    progressTotal: Math.round(Game.gcl.progressTotal),
                    percentage: (Game.gcl.progress / Game.gcl.progressTotal * 100).toFixed(2),
                    decimalLevel: (Game.gcl.level + (Game.gcl.progress / Game.gcl.progressTotal)).toFixed(2)
                },
                rooms: _generateRooms()
            }
        }
    }
};