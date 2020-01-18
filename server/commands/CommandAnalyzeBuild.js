const analyze = require("create-reacticoon-app/analyze/build/analyze");
const Filesystem = require("create-reacticoon-app/utils/Filesystem");
const BuildUtils = require("create-reacticoon-app/utils/BuildUtils");
const CacheUtils = require("create-reacticoon-app/utils/CacheUtils");

// contains the cache namespace for our command.
// the key is the build id, the value the filepath of the generated html report.
const CACHE_KEY = "CommandAnalyzeBuild__FILEPATH";

function CommandAnalyzeBuild(req, res, api) {
  const buildId = BuildUtils.getBuildId();

  // since running analyze takes some time, we cache the results per build.
  let filepath = CacheUtils.get(CACHE_KEY, buildId);
  if (!filepath) {
    const analyzeReport = analyze();

    if (!analyzeReport.success) {
      res.json(analyzeReport);
      return;
    }

    // save on /tmp to remove reports on reboot.
    filepath = `${api.getPluginTmpPath()}/reacticoon_build_analyze.${buildId}.html`;

    Filesystem.saveFile(filepath, analyzeReport.result.html);
    CacheUtils.set(CACHE_KEY, buildId, filepath);
  }

  // give the url to retrieve the file to the front. It will use it on an iframe directly.
  res.json({
    success: true,
    url: `http://localhost:9191/retrieve-file?filepath=${filepath}`
  });
}

module.exports = CommandAnalyzeBuild;
