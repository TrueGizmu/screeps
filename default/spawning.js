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
        
        var harvesterNames = ['Ryjjjć', 'Ryjek', 'Slave', 'Parófć', 'Grzybć', 'Parówa', 'Ryyjkkk', 'Glinoryjec', 'Kiwi'];
        var builderNames = ['Felix', 'FixIt', 'Bob', 'Budowniczy'];
        var upgraderNames = ['TVM0013', 'TVM0050', 'TVM0001', 'TVM0120', 'TVM0002', 'TVM0051', 'TVM0036'];
        var minerNames = ['Ryjówka', 'Sznupka', 'Czarna', 'Kopacz', 'Wiertałka', 'PokeMe'];
        var zergNames = ['ZergQueen', 'ZergPrincess', 'Zergling'];
        
        var spawn = _.find(room.getSpawns(), s => !s.spawning);
        
        if (!spawn) return;
        
        //if there is no containers do not spawn - zerg tiimeee!
        if (!room.getContainers().length) return;

        var harvesters = _.filter(Game.creeps, creep => creep.memory.role == 'harvester' && creep.memory.roomName == room.name);
        var upgraders = _.filter(Game.creeps, creep => creep.memory.role == 'upgrader' && creep.memory.roomName == room.name);
        var builders = _.filter(Game.creeps, creep => creep.memory.role == 'builder' && creep.memory.roomName == room.name);
        var miners = _.filter(Game.creeps, creep => creep.memory.role == 'miner' && creep.memory.roomName == room.name);
        var zergs = _.filter(Game.creeps, creep => creep.name.startsWith('Zerg'));
        var constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
        if (Game.time%50 == 0) {
            console.log('Room:', room.name, ' Harvesters: ', harvesters.length, ' Upgraders: ', upgraders.length, ' Builders: ', builders.length, ' Miners:', miners.length, ' Zergs:', zergs.length);
        }
        
        if (spawn.room.energyAvailable >= 750 && !spawn.spawning) {
        
            if (harvesters.length < 3) {
                var newName = _.find(_.shuffle(harvesterNames), name => Game.creeps[name] == null);
                console.log('Spawning new harvester: ', newName);
                spawn.spawnCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], newName, {memory: {role: 'harvester', roomName: room.name}});
            }
            else if (miners.length < room.memory.containers.length) {
                var newName = _.find(_.shuffle(minerNames), name => Game.creeps[name] == null);
                console.log('Spawning new miner: ', newName);
                spawn.spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE], newName, {memory: {role: 'miner', roomName: room.name}});        
            }
            else if (upgraders.length == 0 || (constructionSites.length == 0 && upgraders.length < 3)) {
                var newName = _.find(_.shuffle(upgraderNames), name => Game.creeps[name] == null);
                console.log('Spawning new upgrader:', newName);
                spawn.spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE], newName, {memory: {role: 'upgrader', roomName: room.name}});
            }
            else if (constructionSites.length > 0 && builders.length < 2) {
                var newName = _.find(_.shuffle(builderNames), name => Game.creeps[name] == null);
                    console.log('Spawning new builder: ' + newName);
                    spawn.spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName, {memory: {role: 'builder', roomName: room.name}});
            }
            else if (zergs.length < 2 || (zergs.length < 3 &&  _.some(zergs, z => z.ticksToLive < 150))) {
                var newName = _.find(_.shuffle(zergNames), name => Game.creeps[name] == null);
                console.log('Spawning new zerg: ' + newName);
                spawn.spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], newName, {memory: {role: 'zerg', roomName: 'E43N29'}});
            }
        }
        else if (spawn.room.energyAvailable >= 300 && harvesters.length < 2) {
            var newName = _.find(harvesterNames, name => Game.creeps[name] == null);
                console.log('Spawning new harvester: ', newName);
                spawn.spawnCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], newName, {memory: {role: 'harvester', roomName: room.name}});
        }
        
        if(spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role + '-' + spawningCreep.name,
                spawn.pos.x, 
                spawn.pos.y + 1, 
                {align: 'left', opacity: 0.8});
        }
    }
};