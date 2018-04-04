let configReqKeys = [
  'el',
  'orbitMode',
  'debugMode',
  'initalCameraPos',
  'materials',
  'cameraAspectFactor',
  'modelUrl',
  'cameraYoffset'
];

//let checkForKeys = (obj, reqKeys) => {
  //let keys = Object.keys(obj);
  //return reqKeys.reduce((bool, key) => {
    //return bool ? obj.hasOwnProperty(key) : bool;
  //}, true);
//};

let formatReturn = (config, ems) => {
  return {
    config: config,
    errorMessages: ems,
    hasError: ems.length > 0
  };
};

export default function (config) {
  var errorMessages = [];
  var breakingError = false;
  // check el
  errorMessages = (!config.hasOwnProperty('el') || typeof config.el == 'undefined' || config.el == {}) ?
    [...errorMessages, 'Config is empty object please fill it with key pairs'] :
    errorMessages;
  if(errorMessages.length > 0) return formatReturn(config, errorMessages);
  // check el is div
  errorMessages = (!config.el || config.el.tagName !== 'DIV') ?
    [...errorMessages, 'invalid el in config'] :
    errorMessages;
  if(errorMessages.length > 0) return formatReturn(config, errorMessages);
  // check req keys
  errorMessages = (function (ems, conf, rKeys) {
    let missingKeys = rKeys.filter(key => !config.hasOwnProperty(key));
    missingKeys.map(key => ems.push('missing config pram ' + key));
    return ems;
  }(errorMessages, config, configReqKeys));
  if(errorMessages.length > 0) return formatReturn(config, errorMessages);
  // check materials
  errorMessages = (function (ems, mats) {
    let invalidMats = mats.reduce((arr, obj) => {
      var ismat  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(obj.color);
      if(!ismat) arr.push(obj);
      return arr;
    }, []);
    invalidMats.map(invalidMat => {
      ems.push(`Invalid color on material ${invalidMat.name}`)
    });
    return ems;
  }(errorMessages, config.materials));
  if(errorMessages.length > 0) return formatReturn(config, errorMessages);


  return ({
    config: config,
    errorMessages: errorMessages,
    hasError: errorMessages.length > 0
  });
}
