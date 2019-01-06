/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.zerg');
 * mod.thing == 'a thing'; // true
 */
var common = require("common");

module.exports = {
    run(creep) {
        if (creep.room.name == creep.memory.roomName) {
            
            if(!creep.memory.mining && creep.carry.energy == 0) {
                creep.memory.mining = true;
                creep.say('kop kop');
            }
            if(creep.memory.mining && creep.carry.energy == creep.carryCapacity) {
                creep.memory.mining = false;
                creep.say('work work');
            }
            
            if (creep.memory.mining) {
                //var source = Game.getObjectById('5bbcaf829099fc012e63ab01');
                var source = creep.pos.findClosestByPath(FIND_SOURCES,{ filter: (str) => {return str.energy >= creep.carryCapacity;}});
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else {
                
                if (common.storeEnergy(creep)) {
                    return;
                }
                
                var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                if(target) {
                    creep.say("Buduj raz");
                    if(creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#317ef9', opacity:0.8}});
                    }
                    return;
                }
                
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                
                /*var source = Game.getObjectById('5c2d23bfa310e97ef303e748');
                if (creep.build(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                */
            }
            /*if(creep.claimController(Game.creeps.Gimli.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.creeps.Gimli.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
            }*/
        }
        else {
            creep.moveTo(Game.getObjectById('5bbcaf829099fc012e63ab00'));
        }
    }
};