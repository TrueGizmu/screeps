/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototypes');
 * mod.thing == 'a thing'; // true
 */

var common = require('common');

Object.defineProperty(StructureContainer.prototype, 'memory', {
    get: function () {
        if (!this._memory) {
            this._memory = _.find(this.room.memory.containers, c => c.id == this.id);
        }
        return this._memory;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(StructureContainer.prototype, 'isFull', {
    get: function () {
        if (!this._isFull) {
            this._isFull = _.sum(this.store) == this.storeCapacity;
        }
        return this._isFull;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(StructureContainer.prototype, 'isEmpty', {
    get: function () {
        if (!this._isEmpty) {
            this._isEmpty = _.sum(this.store) == 0;
        }
        return this._isEmpty;
    },
    enumerable: false,
    configurable: true
});

// Make sure the method has not already been overwritten
if (!StructureSpawn.prototype._spawnCreep) {
    StructureSpawn.prototype._spawnCreep = StructureSpawn.prototype.spawnCreep;

    // The original signature: spawnCreep(body, [name], [opts])
    // Make a new version with the signature spawnCreep(body, [opts])
    StructureSpawn.prototype.spawnCreep = function (body, name = null, opts = undefined) {

        if (!Memory.myCreepNameCounter) Memory.myCreepNameCounter = 0;
        // handling case when name is null, but opts are not
        if (!opts && _.isObject(name)) {
            opts = name;
            name = undefined;
        }

        const harvesterNames = ['Ryjjjcio', 'Ryjek', 'Slave', 'Parofcia', 'Grzybcio', 'Paruwa', 'Ryyjkkk', 'Glinoryjec', 'Kiwi'];
        const builderNames = ['Felix', 'FixIt', 'Bob', 'Budowniczy', 'Robol', 'Majster'];
        const upgraderNames = ['TVM0013', 'TVM0050', 'TVM0001', 'TVM0120', 'TVM0002', 'TVM0051', 'TVM0036', 'TVM0128', 'TVM0111'];
        const minerNames = ['Ryjowka', 'Sznupka', 'Czarna', 'Kopacz', 'Wiertauka', 'Koper', 'Gornik', 'Wiertlo', 'Kopara'];
        const zergNames = ['ZergQueen', 'ZergPrincess', 'Zergling', 'ZergMinion', 'ZergHydralisk', 'ZergDrone', 'ZergMutalisk'];

        let newName = name;
        let roleName = ((opts != null && opts.memory != null) ? opts.memory.role : undefined);


        if (!newName) {
            let roomAlias = this.room.memory.alias;
            let sample;
            // Now we need to generate a name and make sure it hasn't been taken
            for (let i = 0; i < 5; i++) {
                switch (roleName) {
                    case 'harvester':
                        sample = _.sample(harvesterNames);
                        break;
                    case 'builder':
                        sample = _.sample(builderNames);
                        break;
                    case 'upgrader':
                        sample = _.sample(upgraderNames);
                        break;
                    case 'miner':
                        sample = _.sample(minerNames);
                        break;
                    case 'zerg':
                        sample = _.sample(zergNames);
                        break;
                    default:
                        sample = `Noname${Memory.myCreepNameCounter++}`;
                }
                newName = `${sample}_${roomAlias}`;
                console.log(`Trying name ${newName}`);
                if (this._spawnCreep(body, newName, { dryRun: true }) == OK)
                    break;
            }
        }

        // Now we call the original function passing in our generated name and 
        // returning the value
        console.log(`${this.room.name}: Spawning new ${roleName} named ${newName}`);
        console.log('body', JSON.stringify(body));
        return this._spawnCreep(body, newName, opts);
    };
};

Room.prototype.mapTowers = function () {

    if (!this.memory.towers) {
        this.memory.towers = [];
    }

    var roomTowers = _.filter(this.find(FIND_MY_STRUCTURES), f => f.structureType == STRUCTURE_TOWER);

    if (!roomTowers) return;

    for (var i in roomTowers) {
        var id = roomTowers[i].id;
        if (!_.some(this.memory.towers, t => t.id == id)) {

            this.memory.towers.push({ id: id });
            console.log('Room mapping', this.name, '- added new tower', id);
        }
    }
};

Room.prototype.mapSpawns = function () {

    if (!this.memory.spawns) {
        this.memory.spawns = [];
    }

    var roomSpawns = this.find(FIND_MY_SPAWNS);

    if (!roomSpawns) return;

    for (var i in roomSpawns) {
        var id = roomSpawns[i].id;
        if (!_.some(this.memory.spawns, t => t.id == id)) {

            this.memory.spawns.push({ id: id });
            console.log('Room mapping', this.name, '- added new spawn', id);
        }
    }
};

Room.prototype.mapContainers = function () {
    if (!this.memory.containers) {
        this.memory.containers = [];
    }

    var roomContainers = _.filter(this.find(FIND_STRUCTURES), f => f.structureType == STRUCTURE_CONTAINER);

    if (!roomContainers) return;

    for (var i in roomContainers) {
        var id = roomContainers[i].id;
        if (!_.some(this.memory.containers, t => t.id == id)) {

            var sourceType = LOOK_ENERGY;
            var source = _.find(roomContainers[i].pos.findInRange(FIND_SOURCES, 1));
            if (!source) {
                source = _.find(roomContainers[i].pos.findInRange(FIND_MINERALS, 1));
                sourceType = LOOK_MINERALS;
            }

            this.memory.containers.push({ id: id, sourceId: source.id, type: sourceType, isActive: true });
            console.log('Room mapping', this.name, '- added new container', id, sourceType);
        }
        else {
            var container = roomContainers[i];
            if (container.memory.type == LOOK_MINERALS && !container.memory.isActive) {
                var source = Game.getObjectById(container.memory.sourceId);
                if (!container.isFull && !source.ticksToRegeneration) {
                    container.memory.isActive = true;
                }
            }
        }
    }
};

Room.prototype.mapLinks = function () {

    if (!this.memory.links) {
        this.memory.links = [];
    }

    var roomLinks = _.filter(this.find(FIND_MY_STRUCTURES), f => f.structureType == STRUCTURE_LINK);

    if (!roomLinks) return;

    for (var i in roomLinks) {
        var id = roomLinks[i].id;
        if (!_.some(this.memory.links, t => t.id == id)) {

            this.memory.links.push({ id: id, direction: 'IN' });
            console.log('Room mapping', this.name, '- added new link', id);
        }
    }
};

Room.prototype.setAlias = function () {

    if (this.memory.alias) return;

    var warflag = common.getWarflag();
    if (!warflag) return;

    this.memory.alias = warflag.memory.newRoomAlias;
    console.log(`Room mapping ${this.name} - added alias ${this.memory.alias}`);
};

Room.prototype.mapInMemory = function () {

    this.setAlias();
    this.mapTowers();
    this.mapSpawns();
    this.mapContainers();
    this.mapLinks();
};

Room.prototype.getTowers = function () {
    return this.memory.towers.map(c => Game.getObjectById(c.id));
};

Room.prototype.getSpawns = function () {
    return this.memory.spawns.map(c => Game.getObjectById(c.id));
};

Room.prototype.getContainers = function () {
    return this.memory.containers.map(c => Game.getObjectById(c.id));
};

Room.prototype.getLinks = function (direction) {
    var links = this.memory.links;
    if (direction) {
        links = _.filter(links, c => c.direction == direction);
    }
    return links.map(l => Game.getObjectById(l.id));
};

module.exports = {

};