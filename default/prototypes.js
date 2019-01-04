/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototypes');
 * mod.thing == 'a thing'; // true
 */
 
Room.prototype.mapTowers = function() {
    
    var roomTowers = _.filter(this.find(FIND_STRUCTURES), f => f.structureType == STRUCTURE_TOWER);

    if (!roomTowers) return;
    
    if (!this.memory.towers) {
        this.memory.towers = [];
    }
    
    for (var i in roomTowers) {
        var id = roomTowers[i].id;
        if (!_.some(this.memory.towers, t => t.id == id)) {
            
            this.memory.towers.push({id: id});
            console.log('Room mapping',this.name,'- added new tower', id);
        }
    }
};

Room.prototype.mapSpawns = function() {
    
    var roomSpawns = this.find(FIND_MY_SPAWNS);

    if (!roomSpawns) return;
    
    if (!this.memory.spawns) {
        this.memory.spawns = [];
    }
    
    for (var i in roomSpawns) {
        var id = roomSpawns[i].id;
        if (!_.some(this.memory.spawns, t => t.id == id)) {
            
            this.memory.spawns.push({id: id});
            console.log('Room mapping',this.name,'- added new spawn', id);
        }
    }
};

Room.prototype.mapContainers = function() {
    
    var roomContainers = _.filter(this.find(FIND_STRUCTURES), f => f.structureType == STRUCTURE_CONTAINER);

    if (!roomContainers) return;
    
    if (!this.memory.containers) {
        this.memory.containers = [];
    }
    
    for (var i in roomContainers) {
        var id = roomContainers[i].id;
        if (!_.some(this.memory.containers, t => t.id == id)) {
            
            var sourceType = RESOURCE_ENERGY;
            var source = _.find(roomContainers[i].pos.findInRange(FIND_SOURCES, 1));
            if (!source) {
                source = _.find(roomContainers[i].pos.findInRange(FIND_MINERALS, 1));
                sourceType = 'mineral';
            }
            
            this.memory.containers.push({id: id, sourceId:source.id, type:sourceType, isActive:true});
            console.log('Room mapping',this.name,'- added new container', id, sourceType);
        }
    }
};

Room.prototype.mapLinks = function() {
    
    var roomLinks = _.filter(this.find(FIND_STRUCTURES), f => f.structureType == STRUCTURE_LINK);

    if (!roomLinks) return;
    
    if (!this.memory.links) {
        this.memory.links = [];
    }
    
    for (var i in roomLinks) {
        var id = roomLinks[i].id;
        if (!_.some(this.memory.links, t => t.id == id)) {
            
            this.memory.links.push({id: id, direction: 'IN'});
            console.log('Room mapping',this.name,'- added new link', id);
        }
    }
};
 
Room.prototype.mapInMemory = function() {
    
    this.mapTowers();
    this.mapSpawns();
    this.mapContainers();
    this.mapLinks();
};

Room.prototype.getTowers = function() {
    return this.memory.towers.map( c => Game.getObjectById(c.id));
};

Room.prototype.getSpawns = function() {
    return this.memory.spawns.map( c => Game.getObjectById(c.id));
};

Room.prototype.getContainers = function() {
    return this.memory.containers.map( c => Game.getObjectById(c.id));
};

Room.prototype.getLinks = function(direction) {
    var links = this.memory.links;
    if (direction) {
        links = _.filter(links, c => c.direction == direction);
    }
    return links.map(l => Game.getObjectById(l.id));
};

module.exports = {

};