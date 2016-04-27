import fs from 'fs';
import path from 'path';
import assert from 'assert';
import plugin from './index';
import { transform } from 'babel-core';


const REQUIRED_PLUGINS = [
  'babel-plugin-syntax-flow',
  'babel-plugin-syntax-decorators',
  'babel-plugin-syntax-class-properties',
];

function testFixture(dir) {
  const input = fs.readFileSync(path.join(__dirname, 'fixtures', dir, 'input.js'), 'utf8');
  const output = transform(input, {
    plugins: REQUIRED_PLUGINS.concat([plugin]),
  }).code;
  const expectedOutput = fs.readFileSync(path.join(__dirname, 'fixtures', dir, 'output.js'), 'utf8');
  assert.equal(output.trim(), expectedOutput.trim());
}


describe('applying data transformer to', () => {
  describe('a data component', () => {
    it('should make it immutable', () => {
      testFixture('simple-data');
      testFixture('nested-data');
    });

    describe('with a constructor', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('invalid-constructor'),
          (err) => err.message.indexOf('a constructor is not allowed') > 0);
      });
    });

    describe('with a super class', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('invalid-superclass'),
          (err) => err.message.indexOf('no super class allowed') > 0);
      });
    });

    describe('with an "update" method', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('invalid-update-method'),
          (err) => err.message.indexOf('no class member with name \'update\' allowed') > 0);
      });
    });

    describe('with an "update" property', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('invalid-update-property'),
          (err) => err.message.indexOf('no class member with name \'update\' allowed') > 0);
      });
    });

    describe('with a "toMap" method', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('invalid-toMap-method'),
          (err) => err.message.indexOf('no class member with name \'toMap\' allowed') > 0);
      });
    });

    describe('with an "toMap" property', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('invalid-toMap-property'),
          (err) => err.message.indexOf('no class member with name \'toMap\' allowed') > 0);
      });
    });

    describe('with an invalid property name', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('invalid-property-name'),
          (err) => err.message.indexOf('invalid property \'_invalidName\': must start with character') > 0);
      });
    });

    describe('with an invalid property type \'void\'', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('invalid-property-type-void'),
          (err) => err.message.indexOf('invalid property \'voidField\': type \'void\' is not allowed') > 0);
      });
    });

    describe('with an invalid property type \'Array\'', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('invalid-property-type-array'),
          (err) => err.message.indexOf('invalid property \'arrayField\': type \'Array\' is not allowed') > 0);
      });
    });

    describe('with an invalid property type \'Function\'', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('invalid-property-type-func'),
          (err) => err.message.indexOf('invalid property \'funcField\': type \'Function\' is not allowed') > 0);
      });
    });

    describe('with a missing property type', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('missing-property-type'),
          (err) => err.message.indexOf('invalid property \'untypedField\': missing type') > 0);
      });
    });
  });
});
