/* @flow */
/* eslint no-unused-vars:0 */

import SimpleData from './fixtures/simple-data/output';

export function createWithAllFields(): SimpleData {
  return new SimpleData({
    booleanField: true,
    numberField: 101,
    stringField: 'string',
  });
}

export function createWithFieldDefault(): SimpleData {
  return new SimpleData({
    booleanField: true,
    stringField: 'string',
  });
}

export function update() {
  const data = createWithFieldDefault();
  data.update({ stringField: 'new-string' });
}

export function exportToMap() {
  createWithFieldDefault.toMap();
}
