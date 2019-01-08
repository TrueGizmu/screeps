var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMiner = require('role.miner');
var roleZerg = require("role.zerg");
var roleClicker = require("role.clicker");


var spawnController = require('spawning');
var defences = require('defences');
var common = require("common");
var prototypes = require("prototypes");


module.exports.loop = function () {
    
    /*if (Game.time%100 == 0) {
        Game.rooms['E43N29'].createConstructionSite(24,25, STRUCTURE_TOWER);
        Game.rooms['E43N29'].createConstructionSite(30,26, STRUCTURE_EXTENSION);
        Game.rooms['E43N29'].createConstructionSite(30,27, STRUCTURE_EXTENSION);
        Game.rooms['E43N29'].createConstructionSite(31,27, STRUCTURE_EXTENSION);
        Game.rooms['E43N29'].createConstructionSite(32,26, STRUCTURE_EXTENSION);
        Game.rooms['E43N29'].createConstructionSite(33,25, STRUCTURE_EXTENSION);
    }*/
    
    for (var roomName in Memory.rooms) {
        
        var currentRoom = Game.rooms[roomName];
        
        if (Game.time%100 == 0) {
            try {
                currentRoom.mapInMemory();
            } 
            catch (e) {
                console.log(e.stack);
            }
        }

        defences.run(currentRoom);
        
        spawnController.run(currentRoom);
        
        if (Game.time%10 == 0) {
            common.linksTransfer(currentRoom);
        }
    }
    
    common.clearMemory();
    
    for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if (creep.spawning) {
                continue;
            }
            if(creep.memory.role == 'harvester') {
                roleHarvester.run(creep);
            }
            if(creep.memory.role == 'upgrader') {
                roleUpgrader.run(creep);
            }
            if(creep.memory.role == 'builder') {
                roleBuilder.run(creep);
            }
            if(creep.memory.role == 'miner') {
                roleMiner.run(creep);
            }
            // if(creep.memory.role == 'zerg') {
            //     roleZerg.run(creep);
            // }
            if(creep.memory.role == 'clicker') {
                roleClicker.run(creep);
            }
        }
}
