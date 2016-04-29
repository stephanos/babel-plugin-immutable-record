/* @flow */
/* eslint no-unused-vars:0 */

import ShallowRecord from './fixtures/shallow-record/output';

export function createWithAllFields(): ShallowRecord {
  return new ShallowRecord({
    booleanField: true,
    numberField: 101,
    stringField: 'string',
  });
}

export function createWithFieldDefault(): ShallowRecord {
  return new ShallowRecord({
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
