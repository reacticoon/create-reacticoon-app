function check(isValid, validMessage, invalidMessage) {
  if (isValid) {
    return {
      type: 'GOOD',
      message: validMessage,
    }
  } else {
    return { 
      type: 'ERROR',
      message: invalidMessage,
    }
  }
}

module.exports = check;
