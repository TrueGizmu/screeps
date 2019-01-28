var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMiner = require('role.miner');
var roleZerg = require("role.zerg");
var roleClicker = require("role.clicker");
var roleSpeditor = require('role.speditor');
var roleScientist = require('role.scientist');
var roleDestroyer = require('role.destroyer');

var defences = require('defences');
var common = require("common");
var prototypes = require("prototypes");
var transport = require('transport');
var labs = require('labs');
var utilsStats = require('utils.stats');
var utilsBirthControl = require('utils.birthControl');


module.exports.loop = function () {

    for (var roomName in Game.rooms) {

        var currentRoom = Game.rooms[roomName];
        //if no room or no controller or not mine then next ;)
        if (!currentRoom || !currentRoom.controller || !currentRoom.controller.my) continue;

        if (Game.time % 100 == 0) {
            try {
                currentRoom.mapInMemory();
            }
            catch (e) {
                console.log(e.stack);
            }
        }

        defences.run(currentRoom);

        utilsBirthControl.spawn(currentRoom);

        if (Game.time % 5 == 0) {
            labs.runReactions(currentRoom);
        }

        if (Game.time % 10 == 0) {
            common.linksTransfer(currentRoom);
        }
    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.spawning) {
            continue;
        }
        try {
            if (creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            if (creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            if (creep.memory.role == 'builder') {
                roleBuilder.run(creep);
            }
            if (creep.memory.role == 'miner') {
                roleMiner.run(creep);
            }
            if (creep.memory.role == 'zerg') {
                roleZerg.run(creep);
            }
            if (creep.memory.role == 'clicker') {
                roleClicker.run(creep);
            }
            if (creep.memory.role == 'speditor') {
                roleSpeditor.run(creep);
            }
            if (creep.memory.role == 'scientist') {
                roleScientist.run(creep);
            }
            if (creep.memory.role == 'destroyer') {
                roleDestroyer.run(creep);
            }
        } catch (error) {
            console.log(error.stack);
        }
    }

    if (Game.time % 10 == 0) {
        common.clearMemory();
        transport.run();
    }

    try {
        utilsStats.gather();
    } catch (e) {
        console.log(`Something wrong in gathering stats ${e.stack}`);
    }
}
