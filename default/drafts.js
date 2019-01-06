/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('notatnik');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
Game.spawns.SpawnGizmu.spawnCreep([MOVE], 'Legolas');
Game.creeps.Legolas.moveTo(Game.flags.Flag1);

//Game.creeps.Gimli.moveTo(49,16);
    if (Game.creeps.Gimli.room.name == 'E43N29') {
        if(Game.creeps.Gimli.claimController(Game.creeps.Gimli.room.controller) == ERR_NOT_IN_RANGE) {
                Game.creeps.Gimli.moveTo(Game.creeps.Gimli.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
    }
    
    //zerg spawn!!!!
    try {
            var creeps = _.filter(Game.creeps, c => c.name.startsWith('Zerg'));
            for (var i in creeps) {
                var creep = creeps[i];
                
                if (creep.room.name == 'E43N29') {
                    if (creep.name == 'ZergQueen') {
                        var item = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                        
                        if(creep.dismantle(item) == ERR_NOT_IN_RANGE) {
                            creep.say("omnoomnomm");
                            creep.moveTo(item, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                        continue;
                    }
                    
                    if(creep.memory.building && creep.carry.energy == 0) {
                        creep.memory.building = false;
                        creep.say('â kop kop');
            	    }
            	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            	        creep.memory.building = true;
            	        creep.say('ð§ build');
            	    }
                    
                    if (!creep.memory.building) {
                        var source = Game.getObjectById('5bbcaf829099fc012e63ab01');
                        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                    }
                    else {
                        var source = Game.getObjectById('5c2d23bfa310e97ef303e748');
                        if (creep.build(source) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                    }
                    /*if(creep.claimController(Game.creeps.Gimli.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.creeps.Gimli.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }*/
                }
                else {
                    creep.moveTo(Game.getObjectById('5c2d23bfa310e97ef303e748'));
                }
            }
        } catch (e) {console.log(e);}
};