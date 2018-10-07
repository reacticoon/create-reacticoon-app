/** 
 * try to load a module, return false if it can't
 */
const requireOptionnal = modulePath => {
  try {
    return require(modulePath);
  } catch (e) {
    console.error(e)
    return false;
  }
};

module.exports = requireOptionnal;

