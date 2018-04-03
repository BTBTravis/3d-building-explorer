import configs from './spec';
import configValidator from '../lib/configValidator';

import chai from 'chai';
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();


let spec = configs();
console.log('spec: ', spec);
export default function () {
  describe('configValidator module', function () {
    it('Min config', () => {
      let res = configValidator(spec.min);
      expect(res).to.have.property('errorMessages');
      assert.equal(res.errorMessages.length, 0);
    });
    it('Empty Error Message', function(){
      let res = configValidator(spec.empty);
      expect(res).to.have.property('errorMessages');
      assert.equal(res.errorMessages.includes('Config is empty object please fill it with key pairs'), true);
    });
    it('Invalid el message', () => {
      let res = configValidator(spec.invalidEl);
      expect(res).to.have.property('errorMessages');
      assert.equal(res.errorMessages.includes('invalid el in config'), true);
    });
    it('Missing key error message', () => {
      let res = configValidator(spec.missingKey);
      expect(res).to.have.property('errorMessages');
      assert.equal(res.errorMessages.includes('missing config pram orbitMode'), true);
    });
  });
}
