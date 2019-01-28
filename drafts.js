module.exports = {
    Game.rooms.E42N29.terminal.send(RESOURCE_ENERGY, 80000, 'E43N29');
    Game.rooms.E42N29.terminal.send('H', 80000, 'E43N29', 'Bleee');
    
    //spawning
    Game.spawns.SpawnGizmu.spawnCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'GLS', { memory: { role: 'speditor', sourceId: '5c3a970951bc344651daf0e6' , targetId:'5c329901cd8d3949df924bb5'} });

    Game.spawns.SpawnRyjek.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'ZergQueen', { memory: { role: 'zerg', whatToDo: 'work', roomName: 'E43N29'} });
    
    Game.spawns.Zergs.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL], 'Lolek2', { memory: { role: 'destroyer'} });
    
    Game.spawns.SpawnGizmu.spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], 'Robin_Hood', { memory: { role: 'looter'} });
    

    Game.spawns.SpawnGizmu.spawnCreep([MOVE], 'Legolas');
    //transporttt
    var transport = require('transport'); transport.createTransportTask('sourceId','targetId','*',resourceAmount,carryCount,isOptimizedBody, taskId);
    var labs = require('labs'); labs.produce('E42N29', 'OH');
}