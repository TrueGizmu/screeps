module.exports = {
    run: function () {
        if (!Memory.transport || !Memory.transport.tasks)
            return;

        for (var t in Memory.transport.tasks) {

            var task = Memory.transport.tasks[t];
            var creepName = 'DPD_' + t;
            if (!Game.creeps[creepName]) {

                var body = [];
                var moveDiv = task.isOptimizedBody ? 2 : 1;

                for (var i = 0; i < task.carryCount; i++) {
                    body.push(CARRY);
                    if (i % moveDiv == 0)
                        body.push(MOVE);
                }
                var spawns = Game.rooms[task.sourceRoomName].getSpawns();
                if (spawns.length > 0) {
                    spawns[0].spawnCreep(body, creepName, { memory: { role: 'speditor', taskId: t } });
                }
            }
        }
    },

    getTaskById(taskId) {
        if (!Memory.transport || !Memory.transport.tasks)
            return;

        return Memory.transport.tasks[taskId];
    },

    createTransportTask(sourceId,
        targetId,
        resourceType, // default: * (all)
        resourceAmount, // null for infinite
        carryCount, // default 10
        isOptimizedBody, // should use halved MOVE part count? Default false
        taskId // custom task id
    ) {

        var source = Game.getObjectById(sourceId);
        if (!source || !source.structureType || !source.store) {
            console.log('ERROR: Source is not a valid structure with a store');
            return;
        }

        var target = Game.getObjectById(targetId);
        if (!target || !target.structureType) {
            console.log('ERROR: Target is not a valid structure');
            return;
        }

        var task = {
            sourceIds: [sourceId],
            targetId: targetId,
            sourceRoomName: source.room.name,
            targetRoomName: target.room.name,
            resourceType: resourceType || '*',
            resourceAmount: resourceAmount || 9999999,
            carryCount: carryCount || 10,
            isOptimizedBody: !!isOptimizedBody
        }

        var id = taskId || Game.time;
        Memory.transport.tasks[id] = task;

        console.log(`SUCCESS: created task ${id}`);
    }
};