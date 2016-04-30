/* @flow */
/* eslint no-unused-vars:0 */

import { List } from 'immutable';
import ShallowRecord from './fixtures/shallow-record/output';
import NestedRecord from './fixtures/nested-record/output';

export function createShallowRecordWithAllFields(): ShallowRecord {
  return new ShallowRecord({
    arrayField: ['1'],
    booleanField: true,
    numberField: 101,
    stringField: 'string',
  });
}

export function createShallowRecordWithDefaults(): ShallowRecord {
  return new ShallowRecord({
    booleanField: true,
    stringField: 'string',
  });
}

export function updateShallowRecord() {
  const record = createShallowRecordWithAllFields();
  record.update({ stringField: 'new-string' });
}

export function accessFields() {
  const record = createShallowRecordWithAllFields();

  const a: List<string> = record.arrayField;
  const b: bool = record.booleanField;
  const s: string = record.stringField;
  const n: number = record.numberField;
}

export function exportToMap() {
  createShallowRecordWithAllFields().toMap();
}
