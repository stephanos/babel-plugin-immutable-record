import assert from 'assert';

import SimpleData from './fixtures/simple-data/output';


describe('an immutable record', () => {
  it('should have getters', () => {
    const data = new SimpleData({
      booleanField: true,
      stringField: 'string',
    });

    assert.equal(data.booleanField, true);
    assert.equal(data.numberField, 42);
    assert.equal(data.stringField, 'string');
  });

  it('should not be mutable', () => {
    const data = new SimpleData({
      booleanField: true,
      stringField: 'string',
    });

    assert.throws(() => { data.booleanField = false; },
      (err) => err.message.indexOf('Cannot set property booleanField') >= 0);
  });

  it('should not change after update', () => {
    const data = new SimpleData({
      booleanField: true,
      stringField: 'string',
    });
    data.update({ stringField: 'new-string' });

    assert.equal(data.stringField, 'string');
  });

  it('should return new record after update', () => {
    const data = new SimpleData({
      booleanField: true,
      stringField: 'string',
    });

    const newData = data.update({ stringField: 'new-string' });
    assert.equal(newData.stringField, 'new-string');
    assert.notEqual(data, newData);
  });

  it('should export data to Map', () => {
    const data = new SimpleData({
      booleanField: true,
      stringField: 'string',
    });

    const map = data.toMap();
    assert.equal(map.get('booleanField'), true);
    assert.equal(map.get('numberField'), 42);
    assert.equal(map.get('stringField'), 'string');
  });
});
