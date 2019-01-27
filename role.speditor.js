function withdraw(creep, source, task) {

    var resourceType;
    if (task.resourceType == '*') {
        var keys = _.sortBy(Object.keys(source.store), x => source.store[x]);
        for (var prop in keys) {
            if (!source.store[keys[prop]])
                continue;

            resourceType = keys[prop];
            break;
        }
    }
    else {
        resourceType = task.resourceType;
    }

    if (!resourceType || !source.store[resourceType])
        return false;

    creep.withdraw(source, resourceType, Math.min(source.store[resourceType], creep.carryCapacity - _.sum(creep.carry)));
    return true;
}

module.exports = {

    /** @param {Creep} creep **/
    run: function (creep) {

        var task = Memory.transport.tasks[creep.memory.taskId];
        if (!task) {
            creep.suicide();
            return;
        }

        switch (creep.memory.whatToDo) {
            default:
            case 'load':
                if (!creep.memory.activeSourceId)
                    creep.memory.activeSourceId = 0;

                var source = Game.getObjectById(task.sourceIds[creep.memory.activeSourceId]);
                if (!creep.pos.isNearTo(source)) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ff00ff', opacity: 0.8 } });
                    break;
                }

                if (!withdraw(creep, source, task)) {
                    creep.memory.resourceAmount = _.sum(creep.carry);
                    creep.memory.whatToDo = 'unload';
                }

                if (_.sum(creep.carry) == creep.carryCapacity) {
                    creep.memory.resourceAmount = _.sum(creep.carry);
                    creep.memory.whatToDo = 'unload';
                }
                break;

            case 'unload':
                var target = Game.getObjectById(task.targetId);
                if (!creep.pos.isNearTo(target)) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ff00ff', lineStyle: 'dotted', opacity: 0.8 } });
                    break;
                }

                for (var prop in creep.carry) {
                    creep.transfer(target, prop);
                }

                if (_.sum(creep.carry) == 0) {
                    creep.memory.whatToDo = 'load';
                    task.resourceAmount -= creep.memory.resourceAmount;
                    if (task.resourceAmount <= 0) {
                        delete Memory.transport.tasks[creep.memory.taskId];
                        return;
                    }
                    if (!task.sourceIds[++creep.memory.activeSourceId])
                        creep.memory.activeSourceId = 0;
                }
                break;
        }
    }
};