let configReqKeys = [
  "el",
  "orbitMode",
  "debugMode",
  "initalCameraPos"
];

let checkForKeys = (obj, reqKeys) => {
  let keys = Object.keys(obj);
  return reqKeys.reduce((bool, key) => {
    return bool ? obj.hasOwnProperty(key) : bool;
  }, true);
};

export default function (config) {
  var errorMessages = [];
  var breakingError = false;
  if (!config.hasOwnProperty('el') || typeof config.el == 'undefined' || config.el == {} ) errorMessages.push('Config is empty object please fill it with key pairs');
  else if (!config.el || config.el.tagName !== 'DIV') errorMessages.push('invalid el in config');
  else if (!checkForKeys(config, configReqKeys)) {
    let missingKeys = configReqKeys.filter(key => !config.hasOwnProperty(key));
    missingKeys.map(key => errorMessages.push('missing config pram ' + key));
  }

  return ({
    config: config,
    errorMessages: errorMessages,
    hasError: errorMessages.length > 0
  });
}
