/**
 * Allows to use functions on the app without importing it.
 *
 * for example, we can use `tr('key')` without the import { tr } from 'reacticoon/i18n'.
 *
 * The user can add its own auto import using the `autoImport` option:
 *
 * ```
 * [
 *  {
 *    import: '{ funcName }',
 *    from: 'app/test',
 *    functionName: 'functionName'
 *  }
 * ]
 * ```
 *
 * /!\ The user should only use this for very-redondent imports, such as 'tr'.
 */
function autoImportConfigurator(api, config, options, env) {
  //
  // -- auto import
  //

  const autoImportConfig = [
    // reacticoon i18n tr
    {
      import: "{ tr }",
      from: "reacticoon/i18n",
      functionName: "tr"
    }
    // __DEV__
    // TODO: handle propertyName
    // {
    //   import: "{ __DEV__ }",
    //   from: "reacticoon/environment",
    //   propertyName: "__DEV__"
    // }
  ]
    .concat(options.autoImport || [])
    .filter(Boolean);

  const rewireAutoImport = require("../auto-import/rewire-auto-import");
  config = rewireAutoImport(api, config, options, env, autoImportConfig);
}

module.exports = autoImportConfigurator;
