/* @flow */
/* eslint no-unused-vars:0 */

import SimpleRecord from './fixtures/simple-record/output';

export function createWithAllFields(): SimpleRecord {
  return new SimpleRecord({
    booleanField: true,
    numberField: 101,
    stringField: 'string',
  });
}

export function createWithFieldDefault(): SimpleRecord {
  return new SimpleRecord({
    booleanField: true,
    stringField: 'string',
  });
}

export function update() {
  const record = createWithFieldDefault();
  record.update({ stringField: 'new-string' });
}

export function exportToMap() {
  createWithFieldDefault.toMap();
}
