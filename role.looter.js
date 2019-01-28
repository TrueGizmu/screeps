module.exports = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (!Game.flags.loot) {
            return;
        }

        switch (creep.memory.whatToDo) {
            default:
            case 'moveToSteal':

                creep.moveTo( Game.flags.loot);
                if (creep.pos.isNearTo(Game.flags.loot))
                    creep.memory.whatToDo = 'loot';
                break;

            case 'loot':
                if (_.sum(creep.carry) == creep.carryCapacity) {
                    creep.memory.whatToDo = 'stash';
                    creep.memory.lootedAmount = _.sum(creep.carry);
                }

                var target = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure => structure.energy || _.sum(structure.store) });
                if (!creep.pos.isNearTo(target)) {
                    creep.moveTo(target);
                    break;
                }
                if (target) {
                    if (target.energy) {
                        creep.withdraw(target, RESOURCE_ENERGY);
                    }
                    else {
                        var keys = _.sortBy(Object.keys(target.store), x => target.store[x]);
                        for (var prop in keys) {
                            if (!target.store[keys[prop]])
                                continue;

                            creep.withdraw(target, keys[prop]);
                            break;
                        }
                    }
                }
                break;

            case 'stash':
                if (_.sum(creep.carry) == 0) {
                    if (!Memory.lootedEnergy)
                        Memory.lootedEnergy = 0;
                    if (creep.memory.lootedAmount) {
                        Memory.lootedEnergy += creep.memory.lootedAmount;
                        creep.memory.lootedAmount = 0;
                    }

                    if (creep.ticksToLive < 70) {
                        creep.suicide();
                        break;
                    }

                    creep.memory.whatToDo = 'moveToSteal';
                }

                var storage = Game.getObjectById('5c4f3af4f957274b06ac6d34');
                if (!creep.pos.isNearTo(storage)) {
                    creep.moveTo(storage);
                    break;
                }
                for (var prop in creep.carry) {
                    creep.transfer(storage, prop);
                }
                break;
        }
    }
};