function removeReaction(id, room, reason) {
    console.log(`${room.name}: reaction removed because ${reason}`);
    room.memory.chemistry.reactions.splice(id, 1);
}

module.exports = {
    runReactions: function(room) {
        if (!room.memory.chemistry || !room.memory.chemistry.reactions || !room.memory.chemistry.reactions.length)
            return;
        
        var creepName = 'LabRat_' + room.memory.alias;
        if (!Game.creeps[creepName]) {
            var spawns = room.getSpawns();
            if (spawns.length > 0) {
                spawns[0].spawnCreep([MOVE, CARRY, CARRY, MOVE, CARRY, CARRY], creepName, {memory: {role: 'scientist', roomName: room.name } });
            }
        }
        
        for (var item in room.memory.chemistry.reactions) {
            var reaction = room.memory.chemistry.reactions[item];
            
            if (reaction.nextTime && reaction.nextTime >= Game.time) {
                continue;
            }
            
            if (!reaction.isRunning) {
                // check labPoint
                if (!room.memory.chemistry.labPoints.length) {
                    removeReaction(item, room, 'ERROR: No labPoints defined');
                    return;
                }
                
                // find reagents
                var reagents = this.findReagents(reaction.result);
                if (reagents == undefined) {
                    removeReaction(item, room, 'ERROR: Could not find reagents for reaction result ' + reaction.result);
                    return;
                }
                
                // find source labs for reagents
                reaction.sourceLabIds = [];
                for (var id in reagents) {
                    var lab = _.find(room.memory.chemistry.labs, x => x.mineralType == reagents[id]);
                    if (!lab) {
                        removeReaction(item, room, 'ERROR: Could not find lab for reagent ' + reagents[id] + ' for reaction result ' + reaction.result);
                        return;
                    }
                    
                    reaction.sourceLabIds.push(lab.id);
                }
                
                // find target lab for reagent
                var lab = _.find(room.memory.chemistry.labs, x => x.mineralType == reaction.result && !_.some(room.memory.chemistry.reactions, y => y.targetLabId && y.targetLabId == x.id));
                if (!lab) {
                    removeReaction(item, room, 'ERROR: Could not find target lab for reaction result ' + reaction.result);
                    return;
                }
                
                reaction.targetLabId = lab.id;
                
                console.log(`${room.name} SUCCESS: Production of ${reaction.result} started`);
                reaction.isRunning = true;
            }
            
            // run reaction
            var targetLab = Game.getObjectById(reaction.targetLabId);
            if (!targetLab) {
                removeReaction(item, room, 'ERROR: Could not find target lab for reaction result ' + reaction.result);
                return;
            }
            
            var sourceLabs = reaction.sourceLabIds.map(x => Game.getObjectById(x));
            if (!sourceLabs[0] || !sourceLabs[1]) {
                removeReaction(item, room, 'ERROR: Could not find source lab for reaction result ' + reaction.result);
                return;
            }
            
            var result = targetLab.runReaction(sourceLabs[0], sourceLabs[1]);
            if (result == OK) {
                reaction.nextTime = Game.time + REACTION_TIME[reaction.result] - 1;
            }
            else if (result == ERR_FULL) {
                removeReaction(item, room, 'WARN: Production of ' + reaction.result + ' finished');
                return;
            }
            else {
                console.log(`${room.name} WARN: Production of ${reaction.result} returned error ${result}`);
                reaction.nextTime = Game.time + 50;
            }
        }
    },
    
    startReaction: function(roomName, resultMineral) {
        
        var room = Game.rooms[roomName];
        if (!room) {
            console.log('ERROR: could not find room', roomAlias);
            return;
        }
        
        room.memory.chemistry.reactions.push( { result: resultMineral } );
    },
    
    produce: function(roomName, resultMineral) {
        
        var room = Game.rooms[roomName];
        if (!room) {
            console.log('ERROR: could not find room', roomAlias);
            return;
        }
        
        var sourceLabIds = _.filter(room.memory.chemistry.labs, x => x.isSource).map(x => x.id);
        
        if (sourceLabIds.length != 2) {
            console.log('ERROR: Exactly two source lab ids are required', roomAlias);
            return;
        }
                
        // find reagents
        var reagents = this.findReagents(resultMineral);
        if (reagents == undefined) {
            console.log('ERROR: Could not find reagents for reaction result ' + resultMineral);
            return;
        }
        
        // clear running reactions
        room.memory.chemistry.reactions = [];
        
        for (var prop in room.memory.chemistry.labs) {
            var lab = room.memory.chemistry.labs[prop];
            if (lab.isUpgrading)
                continue;
            
            if (lab.id == sourceLabIds[0])
                lab.mineralType = reagents[0];
            else if (lab.id == sourceLabIds[1])
                lab.mineralType = reagents[1];
            else {
                lab.mineralType = resultMineral;
                this.startReaction(roomName, resultMineral);
            }
        }
    },

    findReagents: function(result) {
        for (var re1 in REACTIONS) {
            for (var re2 in REACTIONS[re1]) {
                if (REACTIONS[re1][re2] == result) {
                    return [re1, re2];
                } 
            }
        }
        
        return undefined;
    }
};