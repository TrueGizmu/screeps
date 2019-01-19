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
    run: function(creep) {
        switch (creep.memory.state) {
            
            case 'load':
                if (_.sum(creep.carry) == creep.carryCapacity) {
                    creep.memory.state = 'unload';
                }
                                
                var source = Game.getObjectById(creep.memory.sourceId);
                if (!creep.pos.isNearTo(source)) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ff00ff', opacity: 0.8}});
                    break;
                }
                
                if (creep.withdraw(source, RESOURCE_ENERGY) == OK) {
                    creep.memory.state = 'unload';
                }
                break;
                
            case 'unload':
                    if (_.sum(creep.carry) == 0) {
                        creep.memory.state = 'load';
                    }
                
                    var target = Game.getObjectById(creep.memory.targetId);
                    if (!creep.pos.isNearTo(target)) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ff00ff', lineStyle:'dotted', opacity: 0.8}});
                        break;
                    }
                
                    for (var prop in creep.carry) {
                        creep.transfer(target, prop);
                    }
                break;
                
            default:
                creep.memory.state = 'load';
        }
	}
};