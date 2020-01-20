const os = require("os");

const interfaces = os.networkInterfaces();

let port = 10000;

const getNetworkNextAvailablePort = () => {
  // TODO: verify port is not used.
  port++;
  return port;
};

const getNetworkAddress = () => {
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      const { address, family, internal } = interface;
      if (family === "IPv4" && !internal) {
        return address;
      }
    }
  }
};

module.exports = {
  getNetworkAddress,
  getNetworkNextAvailablePort
};
