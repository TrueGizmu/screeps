/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototypes.spawn');
 * mod.thing == 'a thing'; // true
 */

StructureSpawn.prototype.getNewName = function (roleName) {
    const harvesterNames = ['Ryjjjcio', 'Ryjek', 'Slave', 'Parófcia', 'Grzybć', 'Parówa', 'Ryyjkkk', 'Glinoryjec', 'Kiwi'];
    const builderNames = ['Felix', 'FixIt', 'Bob', 'Budowniczy', 'Robol', 'Majster'];
    const upgraderNames = ['TVM0013', 'TVM0050', 'TVM0001', 'TVM0120', 'TVM0002', 'TVM0051', 'TVM0036', 'TVM0128', 'TVM0111'];
    const minerNames = ['Ryjówka', 'Sznupka', 'Czarna', 'Kopacz', 'Wiertałka', 'Koper', 'Górnik', 'Wiertło', 'Kopara'];
    const zergNames = ['ZergQueen', 'ZergPrincess', 'Zergling', 'ZergMinion', 'ZergHydralisk', 'ZergDrone', 'ZergMutalisk'];

    let newName;
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
        if (this._spawnCreep([MOVE], newName, { dryRun: true }) == OK)
            break;
    }

    return newName;
};

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

        let newName = name;
        let roleName = ((opts != null && opts.memory != null) ? opts.memory.role : undefined);

        if (!newName) {
            newName = this.getNewName(roleName);
        }

        // Now we call the original function passing in our generated name and 
        // returning the value
        console.log(`${this.room.name}: Spawning new ${roleName} named ${newName}`);
        console.log('body', JSON.stringify(body));
        return this._spawnCreep(body, newName, opts);
    };
};

module.exports = {

};