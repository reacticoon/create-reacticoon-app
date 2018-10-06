const invariant = require("invariant");
const isArray = require("lodash/isArray");
const isFunction = require("lodash/isFunction");
const isEmpty = require("lodash/isEmpty");
const find = require("lodash/find");

const createRootGenerator = props => {
  invariant(
    isArray(props.templates) && !isEmpty(props.templates),
    `'templates' required`
  );

  return {
    ...props,
    hasTemplate: templateName => {
      return (
        find(props.templates, template => template.name === templateName) !==
        undefined
      );
    },
    getTemplateListStr: () => {
      let str = ''

      props.templates.forEach(template => {
        if (str == '') {
          str = template
        } else {
          str = `${str}\n${template}`
        }
      })

      return str
    }
  };
};

module.exports = createRootGenerator;
