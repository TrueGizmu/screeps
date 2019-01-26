/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototypes.container');
 * mod.thing == 'a thing'; // true
 */

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

module.exports = {

};