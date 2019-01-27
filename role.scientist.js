module.exports = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.room.name != creep.memory.roomName) {
            creep.moveTo(Game.rooms[creep.memory.roomName].controller, { visualizePathStyle: { stroke: '#00ffff', opacity: 0.8 } });
            return;
        }

        for (var i = 0; i < 5; i++) {
            var state = creep.memory.whatToDo;
            runInternal(creep);

            if (state == creep.memory.whatToDo)
                break;
        }
    }
};

function runInternal(creep) {

    switch (creep.memory.whatToDo) {

        case 'SCI_goToTerminal':

            if (!creep.pos.isNearTo(creep.room.terminal)) {
                creep.moveTo(creep.room.terminal, { visualizePathStyle: { stroke: '#00ffff', opacity: 0.8 } });
                break;
            }

            var reactions = creep.room.memory.chemistry.reactions;

            // select id, mineralType and amountNeeded of every source labs
            var mineralsNeeded = _.uniq(_.flatten(reactions.map(x => x.sourceLabIds))
                .concat(_.filter(creep.room.memory.chemistry.labs, x => x.isBoosting).map(x => x.id))
            ).map(x => {
                var lab = Game.getObjectById(x)
                var neededMineralType = _.find(creep.room.memory.chemistry.labs, l => l.id == x).mineralType;
                var mineralAmount = lab.mineralType && lab.mineralType != neededMineralType ? 0 : (3000 - lab.mineralAmount);
                return {
                    labId: x,
                    mineralType: neededMineralType,
                    amount: mineralAmount
                }
            });

            // calculate total amount needed scaled to creep's carry capacity
            var totalAmountNeeded = _.sum(mineralsNeeded, x => x.amount);
            if (totalAmountNeeded) {
                for (var prop in mineralsNeeded) {
                    mineralsNeeded[prop].amount = Math.min(Math.floor(mineralsNeeded[prop].amount / totalAmountNeeded * creep.carryCapacity), mineralsNeeded[prop].amount)
                }
            }

            creep.memory.mineralsToLoad = mineralsNeeded;

            creep.memory.whatToDo = 'SCI_unloadCreep';
            break;

        case 'SCI_unloadCreep':
            if (_.sum(creep.carry) == 0) {
                creep.memory.whatToDo = 'SCI_load';
                break;
            }

            for (var prop in creep.carry) {
                if (creep.carry[prop] == 0)
                    continue;

                creep.transfer(creep.room.terminal, prop);
                return;
            }

            creep.memory.whatToDo = 'SCI_load';
            break;

        case 'SCI_load':

            if (_.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.whatToDo = 'SCI_goToLabPoint';
                break;
            }

            for (var prop in creep.memory.mineralsToLoad) {

                var demand = creep.memory.mineralsToLoad[prop];
                if (!demand.amount || demand.isLoaded)
                    continue;

                creep.withdraw(creep.room.terminal, demand.mineralType, Math.min(demand.amount, creep.room.terminal.store[demand.mineralType]));
                demand.isLoaded = true;
                return;
            }

            creep.memory.whatToDo = 'SCI_goToLabPoint';
            break;

        case 'SCI_goToLabPoint':

            if (!creep.memory.currentLabPointId)
                creep.memory.currentLabPointId = 0;

            var labPoint = creep.room.memory.chemistry.labPoints[creep.memory.currentLabPointId];

            creep.moveTo(labPoint.x, labPoint.y, { visualizePathStyle: { stroke: '#00ffff', lineStyle: 'dotted', opacity: 0.8 } });
            if (creep.pos.x == labPoint.x && creep.pos.y == labPoint.y)
                creep.memory.whatToDo = 'SCI_loadLabs';
            break;

        case 'SCI_loadLabs':

            for (var prop in creep.memory.mineralsToLoad) {

                var demand = creep.memory.mineralsToLoad[prop];
                if (demand.isDelivered)
                    continue;

                if (creep.transfer(Game.getObjectById(demand.labId), demand.mineralType, Math.min(demand.amount, creep.carry[demand.mineralType])) == ERR_NOT_IN_RANGE)
                    continue;

                demand.isDelivered = true;
                return;
            }

            creep.memory.whatToDo = 'SCI_calculateResultsToLoad';

            break;

        case 'SCI_calculateResultsToLoad':

            var sourceLabIds = creep.memory.mineralsToLoad.map(x => x.labId);
            var resultsToLoad = _.filter(creep.room.memory.chemistry.labs.map(x => { return { memory: x, obj: Game.getObjectById(x.id) } }),
                x => x.obj.mineralType && x.obj.mineralAmount > 0 && (x.obj.mineralType != x.memory.mineralType || (!sourceLabIds.includes(x.obj.id) && x.obj.mineralAmount >= 50)))
                .map(x => {
                    return {
                        id: x.obj.id,
                        mineralType: x.obj.mineralType
                    }
                });

            creep.memory.resultsToLoad = resultsToLoad;

            creep.memory.whatToDo = 'SCI_unloadLabs';
            break;

        case 'SCI_goToLabPointUnload':

            var labPoint = creep.room.memory.chemistry.labPoints[creep.memory.currentLabPointId];

            creep.moveTo(labPoint.x, labPoint.y, { visualizePathStyle: { stroke: '#00ffff', lineStyle: 'dotted', opacity: 0.8 } });
            if (creep.pos.x == labPoint.x && creep.pos.y == labPoint.y)
                creep.memory.whatToDo = 'SCI_calculateResultsToLoad';
            break;

        case 'SCI_unloadLabs':

            if (_.sum(creep.carry) == creep.carryCapacity) {
                creep.memory.whatToDo = 'SCI_goToTerminal';
                break;
            }

            var resultsToLoad = creep.memory.resultsToLoad;
            for (var prop in resultsToLoad) {

                var demand = resultsToLoad[prop];
                if (demand.isInvalid)
                    continue;

                var lab = Game.getObjectById(demand.id);
                var result = creep.withdraw(lab, demand.mineralType, Math.min(lab.mineralAmount, creep.carryCapacity - _.sum(creep.carry)));
                if (result != OK)
                    demand.isInvalid = true;
                else
                    return;
            }

            if (creep.room.memory.chemistry.labPoints[++creep.memory.currentLabPointId]) {
                creep.memory.whatToDo = 'SCI_goToLabPointUnload';
            }
            else {
                creep.memory.currentLabPointId = 0;
                creep.memory.whatToDo = 'SCI_goToTerminal';
            }

            break;

        default:
            creep.memory.whatToDo = 'SCI_goToTerminal';
    }
}