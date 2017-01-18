/* @flow */

import assert from 'assert';
import { List, Map } from 'immutable';

import ShallowRecord from './fixtures/shallow-record/output';
import NestedRecord from './fixtures/nested-record/output';


describe('an immutable record', () => {
  describe('should have getters', () => {
    it('for primitive fields', () => {
      const record = new ShallowRecord({
        booleanField: true,
        stringField: 'string',
      });

      const b: boolean = record.booleanField;
      const n: number = record.numberField;
      const s: string = record.stringField;

      assert.equal(n, 42);
      assert.equal(b, true);
      assert.equal(s, 'string');
    });

    it('for an array field', () => {
      const record = new ShallowRecord({
        arrayField: ['John', 'Ringo'],
        booleanField: true,
        stringField: 'string',
      });

      const a: List<string> = record.arrayField;
      assert.deepEqual(a, List(['John', 'Ringo']));
    });

    it('for a record field', () => {
      const embedded = new ShallowRecord({
        booleanField: false, stringField: 'string' });
      const record = new NestedRecord({
        recordField: embedded,
        recordsField: [embedded],
      });

      assert.deepEqual(record.recordField, embedded);
      assert.deepEqual(record.recordsField, List([embedded]));
    });
  });

  it('should not allow mutation', () => {
    const record = new ShallowRecord({
      booleanField: true, stringField: 'string' });

    record.arrayField.push('test');
    assert.equal(record.arrayField, List());
  });

  it('should not change after update', () => {
    const record = new ShallowRecord({
      booleanField: true, stringField: 'string' });
    record.update({ stringField: 'new-string' });

    assert.equal(record.stringField, 'string');
  });

  it('should return new record after update', () => {
    const record = new ShallowRecord({
      booleanField: true, stringField: 'string' });

    const newRecord = record.update({ stringField: 'new-string' });
    assert.equal(newRecord.stringField, 'new-string');
    assert.notEqual(record, newRecord);
  });

  describe('should export data to Map', () => {
    it('for primitive fields', () => {
      const record = new ShallowRecord({
        booleanField: true, stringField: 'string' });

      const map = record.toMap();
      assert.deepEqual(map, Map({
        arrayField: List(),
        stringField: 'string',
        booleanField: true,
        numberField: 42,
      }));
    });

    it('for embedded record fields', () => {
      const record = new NestedRecord({
        recordField: new ShallowRecord({ booleanField: false, stringField: '1' }),
        recordsField: [
          new ShallowRecord({ booleanField: true, stringField: '2' }),
          new ShallowRecord({ booleanField: true, stringField: '3' }),
        ],
      });

      const map = record.toMap();
      assert.deepEqual(map.toJS(), Map({
        recordField: Map({
          arrayField: List(),
          stringField: '1',
          booleanField: false,
          numberField: 42,
        }),
        recordsField: List([Map({
          arrayField: List(),
          stringField: '2',
          booleanField: true,
          numberField: 42,
        }), Map({
          arrayField: List(),
          stringField: '3',
          booleanField: true,
          numberField: 42,
        })]),
      }).toJS());
    });
  });
});
