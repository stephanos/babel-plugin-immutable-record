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

function transpile(input, pluginOpts = {}) {
  const plugins = REQUIRED_PLUGINS.slice();
  plugins.push([plugin, pluginOpts]);
  const options = { plugins };
  return transform(input, options).code;
}

function testFixture(dir, pluginOpts = {}) {
  const fixtureDir = path.join(__dirname, 'fixtures', dir);
  const actual = transpile(fs.readFileSync(path.join(fixtureDir, 'input.js'), 'utf8'), pluginOpts);
  const expected = fs.readFileSync(path.join(fixtureDir, 'output.js'), 'utf8');
  assert.equal(actual.trim(), expected.trim());
}


describe('applying record transformer to', () => {
  describe('a record', () => {
    describe('that only consists of JavaScript primitives', () => {
      it('should make it immutable', () => {
        testFixture('shallow-record');
      });
    });

    it('with custom decorator name', () => {
      testFixture('custom-decorator-name', { decoratorName: 'Data' });
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

    describe('with an invalid property type \'Object\'', () => {
      it('should fail', () => {
        assert.throws(() => testFixture('invalid-property-type-object'),
          (err) => err.message.indexOf('invalid property \'objectField\': type \'Object\' is not allowed') > 0);
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

  describe('not a record', () => {
    testFixture('non-record');
  });
});
