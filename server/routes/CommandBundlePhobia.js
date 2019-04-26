const BundlePhobia = require("../../analyze/bundlePhobia/BundlePhobia");

function CommandBundlePhobia(req, res) {
  res.json(BundlePhobia.analyzeDependencies());
}

module.exports = CommandBundlePhobia;
