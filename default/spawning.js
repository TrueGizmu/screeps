/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawning');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    
    run: function(room) {
        //if there is no containers do not spawn - zerg tiimeee!
        if (!room.getContainers().length) return;
        
        var spawn = _.find(room.getSpawns(), s => !s.spawning);
        if (!spawn) return;
        
        var harvesters = _.filter(Game.creeps, creep => creep.memory.role == 'harvester' && creep.memory.roomName == room.name);
        var upgraders = _.filter(Game.creeps, creep => creep.memory.role == 'upgrader' && creep.memory.roomName == room.name);
        var builders = _.filter(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.roomName == room.name);
        var miners = _.filter(Game.creeps, creep => creep.memory.role == 'miner' && creep.memory.roomName == room.name);
        var zergs = _.filter(Game.creeps, creep => creep.name.startsWith('Zerg'));
        var clickers = _.filter(Game.creeps, creep => creep.memory.role == 'clicker');
        
        var constructionSites = room.find(FIND_CONSTRUCTION_SITES);
        
        if (Game.time%50 == 0) {
            console.log('Room:', room.name, ' Harvesters: ', harvesters.length, ' Upgraders: ', upgraders.length, ' Builders: ', builders.length, ' Miners:', miners.length, ' Zergs:', zergs.length);
        }
        
        if (room.energyAvailable >= 750) {
        
            if (harvesters.length < 3) {
                spawn.spawnCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], {memory: {role: 'harvester', roomName: room.name}});
                return;
            }
            
            if (miners.length < _.filter(room.memory.containers, c => c.isActive).length) {
                spawn.spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE], {memory: {role: 'miner', roomName: room.name}});
                return;
            }
            
            if (upgraders.length == 0 || (constructionSites.length == 0 && upgraders.length < 3)) {
                spawn.spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE], {memory: {role: 'upgrader', roomName: room.name}});
                return;
            }
            
            if (constructionSites.length > 0 && builders.length < 2) {
                spawn.spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], {memory: {role: 'builder', roomName: room.name}});
                return;
            }
            
            if (zergs.length < 2 || (zergs.length < 3 &&  _.some(zergs, z => z.ticksToLive < 150))) {
                spawn.spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], {memory: {role: 'zerg', roomName: 'E43N29'}});
                return;
            }
            
            if (clickers.length < _.filter(Game.flags, f => f.color == COLOR_PURPLE).length) {
                spawn.spawnCreep([CLAIM,MOVE], {memory: {role: 'clicker'}});
                return;
            }
        }
        else if (spawn.room.energyAvailable >= 300 && harvesters.length < 2) {
            spawn.spawnCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], {memory: {role: 'harvester', roomName: room.name}});
        }
    }
};