function warn(isValid, validMessage, warnMessage) {
  if (!isValid) {
    return {
      type: 'WARN',
      message: `${warnMessage}`,
    }
  } else {
    return {
      type: 'GOOD',
      message: `${validMessage}`,
    }
  }
}

module.exports = warn;
