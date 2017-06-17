/**
 * @author       Axel SHAÏTA <shaita.axel@gmail.com>
 */
const Container = require('./Container');

/**
 * @module
 * @description The container builder
 */
module.exports = {
  /**
   * @function create
   * @description Create an empty container
   */
  create() {
    return new Container();
  },

  /**
   * @function build
   * @description Create a container with a configuration file
   * @param {string} rootDir - The absolute path of the root directory
   * @param {string} configPath - The relative path of the configuration file
   */
  build(rootDir, configPath) {
    const container = new Container();
    container.load(rootDir, configPath);
    return container;
  }
};
