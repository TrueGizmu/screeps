/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.clicker');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run(creep) {
        if (!creep.memory.flagName) {
            var target = _.find(Game.flags, s => s.color == COLOR_PURPLE && _.every(Game.creeps, c=>c.memory.flagName != s.name));
            if (target) {
                creep.memory.flagName = target.name;
            }
            else {
                console.log('Clicker', creep.name, 'cannot find assignement');
                creep.say('boooriingg');
            }
        }
        else {
            var flag = Game.flags[creep.memory.flagName];
            if (!flag) {
                creep.memory.flagName = null;
            }
            
            if (!flag.room || creep.room.name != flag.room.name) {
                creep.moveTo(flag, {visualizePathStyle: {stroke: '#ff00ff', opacity: 0.8}});
            }
            else {
                var result = creep.reserveController(creep.room.controller);
                if (result == ERR_NOT_IN_RANGE) {
                     creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ff00ff', opacity: 0.8}});
                }
                else if (result == OK && (!creep.room.controller.sign)) {
                    creep.signController(creep.room.controller, "I'll be back!");
                }
            }
        }
    }
};