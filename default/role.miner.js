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
        if (!creep.memory.containerId || !creep.memory.sourceId) {
            var roomName = creep.room.name;
            var containers = creep.room.memory.containers;//.getContainers();

            var target = _.find(containers, s => _.every(Game.creeps, c=>c.memory.containerId != s.id));
            if (target) {
                creep.memory.containerId = target.id;
                creep.memory.sourceId = target.sourceId;
            }
            else {
                console.log('Miner', creep.name, 'cannot find assignement');
                creep.say('😭');
            }
        }
        else {
            var container = Game.getObjectById(creep.memory.containerId);
            var source = Game.getObjectById(creep.memory.sourceId);
            if (_.sum(container.store) < container.storeCapacity) {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
	}
};