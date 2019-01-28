var common = require('common');

function findLab(creep, mineralType) {
    return _.find(creep.room.memory.chemistry.labs, l => l.isBoosting && l.mineralType == mineralType);
}

function boostCreep(creep, mineralType, nextState) {
    var boostLab = findLab(creep, mineralType);
    if (!boostLab) {
        common.changeState(creep, nextState);
        return;
    }
    if (boostLab.boostCreep(creep) == ERR_NOT_IN_RANGE) {
        creep.moveTo(boostLab);
        return;
    }

    common.changeState(creep, nextState);
}

module.exports = {
    run(creep) {

        var damageTaken = creep.hitsMax - creep.hits;
        if (damageTaken >= 200) {
            creep.heal(creep);
            return;
        }

        switch (creep.memory.whatToDo) {
            default:
            case 'boostHeal':
                boostCreep(creep, 'XLHO2', 'boostDismantle');
                break;
            case 'boostDismantle':
                boostCreep(creep, 'XZH2O', 'boostTough');
                break;
            case 'boostTough':
                boostCreep(creep, 'XGHO2', 'moveToEngage');
                break;
            case 'moveToEngage':
                if (!creep.memory.thingsToDismantle) {
                    var flags = _.filter(Game.flags, f => f.name.startsWith('Dismantle'));
                    if (flags) {
                        flags = _.sortBy(flags, 'name').map(s => { return { name: s.name, targets: [] } });
                    }
                    creep.memory.thingsToDismantle = flags;
                }

                var flag = Game.flags[creep.memory.thingsToDismantle[0].name];

                creep.moveTo(flag, { visualizePathStyle: { stroke: '#ffaa00' } });

                if (flag.room && creep.room.name == flag.room.name) {
                    for (var i = 0; i < creep.memory.thingsToDismantle.length; i++) {
                        flag = Game.flags[creep.memory.thingsToDismantle[i].name];
                        var targets = _.filter(flag.pos.lookFor(LOOK_STRUCTURES), x => x.structureType != STRUCTURE_ROAD);
                        if (!targets.length) {
                            //creep.memory.thingsToDismantle.shift(1);
                            continue;
                        }

                        creep.memory.thingsToDismantle[i].targets = _.sortBy(targets, x => x.structureType != STRUCTURE_RAMPART).map(x => x.id);   
                    }
                    console.log(JSON.stringify(creep.memory.thingsToDismantle));
                    common.changeState(creep, 'work');
                }

                break;
            case 'work':
                var dismantleField = creep.memory.thingsToDismantle[0];

                if (!dismantleField) {
                    common.changeState('idle');
                    break;
                }

                if (!dismantleField.targets.length) {
                    creep.memory.thingsToDismantle.shift(1);
                    break;
                }
                
                var target = Game.getObjectById(dismantleField.targets[0]);
                if (!target) {
                    dismantleField.targets.shift(1);
                    break;
                }

                var result = creep.dismantle(target);
                if (result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                    break;
                }
                else if (result == ERR_INVALID_TARGET) {
                    dismantleField.targets.shift(1);
                    break;
                }
                
                break;
            case 'idle':
                creep.say('boooriingg');
                break;
        }
    }
}