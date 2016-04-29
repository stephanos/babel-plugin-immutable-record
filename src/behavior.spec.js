import assert from 'assert';
import { List } from 'immutable';

import ShallowRecord from './fixtures/shallow-record/output';


describe('an immutable record', () => {
  it('should have getters', () => {
    const record = new ShallowRecord({
      booleanField: true,
      stringField: 'string',
    });

    assert.equal(record.arrayField, List());
    assert.equal(record.booleanField, true);
    assert.equal(record.numberField, 42);
    assert.equal(record.stringField, 'string');
  });

  it('should not be mutable', () => {
    const record = new ShallowRecord({
      booleanField: true,
      stringField: 'string',
    });

    assert.throws(() => { record.booleanField = false; },
      (err) => err.message.indexOf('Cannot set property booleanField') >= 0);

    record.arrayField.push('test');
    assert.equal(record.arrayField, List());
  });

  it('should not change after update', () => {
    const record = new ShallowRecord({
      booleanField: true,
      stringField: 'string',
    });
    record.update({ stringField: 'new-string' });

    assert.equal(record.stringField, 'string');
  });

  it('should return new record after update', () => {
    const record = new ShallowRecord({
      booleanField: true,
      stringField: 'string',
    });

    const newRecord = record.update({ stringField: 'new-string' });
    assert.equal(newRecord.stringField, 'new-string');
    assert.notEqual(record, newRecord);
  });

  it('should export data to Map', () => {
    const record = new ShallowRecord({
      booleanField: true,
      stringField: 'string',
    });

    const map = record.toMap();
    assert.equal(map.get('arrayField'), List());
    assert.equal(map.get('booleanField'), true);
    assert.equal(map.get('numberField'), 42);
    assert.equal(map.get('stringField'), 'string');
  });
});
