/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototypes.link');
 * mod.thing == 'a thing'; // true
 */

Object.defineProperty(StructureLink.prototype, 'isFull', {
    get: function () {
        if (!this._isFull) {
            this._isFull = this.energy == this.energyCapacity;
        }
        return this._isFull;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(StructureLink.prototype, 'isEmpty', {
    get: function () {
        if (!this._isEmpty) {
            this._isEmpty = this.energy == 0;
        }
        return this._isEmpty;
    },
    enumerable: false,
    configurable: true
});

module.exports = {

};