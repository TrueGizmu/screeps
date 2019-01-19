/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototypes.room');
 * mod.thing == 'a thing'; // true
 */

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

Room.prototype.mapLabs = function () {

    if (!this.memory.labs) {
        this.memory.labs = [];
    }

    var items = _.filter(this.find(FIND_MY_STRUCTURES), f => f.structureType == STRUCTURE_LAB);

    if (!items) return;

    for (var i in items) {
        var id = items[i].id;
        if (!_.some(this.memory.labs, t => t.id == id)) {

            this.memory.labs.push({ id: id });
            console.log('Room mapping', this.name, '- added new lab', id);
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
    this.mapLabs();
};

Room.prototype.getTowers = function () {
    return this.memory.towers.map(c => Game.getObjectById(c.id));
};

Room.prototype.getSpawns = function () {
    return this.memory.spawns.map(c => Game.getObjectById(c.id));
};

Room.prototype.getContainers = function () {
    return _.filter(this.memory.containers.map(c => Game.getObjectById(c.id)), x => x);
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