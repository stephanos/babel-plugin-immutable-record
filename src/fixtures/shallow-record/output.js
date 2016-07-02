/* @flow */

import Record from '../decorator';

import { Iterable, List, Map } from 'immutable';

function toMap(v) {
  if (v instanceof Iterable) {
    return v.map(toMap);
  }

  if (v instanceof Record.Base) {
    return v.toMap();
  }

  return v;
}

@Record('name')
class MyRecord extends Record.Base {
  data: Map<string, any>;

  constructor(init: MyRecordInit) {
    super();

    if (init) {
      this.data = Map({
        arrayField: List(init.arrayField || []),
        stringField: init.stringField,
        booleanField: init.booleanField,
        numberField: init.numberField || 42
      });
    }
  }

  get arrayField(): List<string> {
    return this.data.get('arrayField');
  }

  get stringField(): string {
    return this.data.get('stringField');
  }

  get booleanField(): bool {
    return this.data.get('booleanField');
  }

  get numberField(): number {
    return this.data.get('numberField');
  }

  update(update: MyRecordUpdate): MyRecord {
    const updated = Object.create(MyRecord.prototype);
    updated.data = this.data.merge(update);
    return updated;
  }

  toMap(): Map<string, any> {
    return toMap(this.data);
  }

}

type MyRecordUpdate = {
  arrayField?: string[];
  stringField?: string;
  booleanField?: bool;
  numberField?: number;
  [key: string]: void;
};
type MyRecordInit = {
  arrayField?: string[];
  stringField: string;
  booleanField: bool;
  numberField?: number;
  [key: string]: void;
};
export default MyRecord;
