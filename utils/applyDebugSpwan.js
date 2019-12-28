// https://stackoverflow.com/questions/27688804/how-do-i-debug-error-spawn-enoent-on-node-js
module.exports = function() {
  var childProcess = require("child_process");
  var oldSpawn = childProcess.spawn;
  function mySpawn() {
    console.log("spawn called");
    console.trace();
    console.log(arguments);
    var result = oldSpawn.apply(this, arguments);
    childProcess.spawn = oldSpawn; // reset
    return result;
  }
  childProcess.spawn = mySpawn;
};
