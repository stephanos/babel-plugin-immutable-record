/* @flow */

import Record from '../decorator';

import { Map } from 'immutable';

/*::`*/@Record('name')
/*::`;*/class MyRecord extends Record.Base {
  constructor(init: MyRecordInit) {
    super();
    this.__stringField = init.stringField;
    this.__booleanField = init.booleanField;
    this.__numberField = init.numberField || 42;
  }

  __stringField: string;
  __booleanField: bool;
  __numberField: number;

  get stringField(): string {
    return this.__stringField;
  }

  get booleanField(): bool {
    return this.__booleanField;
  }

  get numberField(): number {
    return this.__numberField;
  }

  update(update: MyRecordUpdate): MyRecord {
    return new MyRecord({
      stringField: update.stringField || this.__stringField,
      booleanField: update.booleanField || this.__booleanField,
      numberField: update.numberField || this.__numberField
    });
  }

  toMap(): Map<string, any> {
    return Map({
      stringField: this.__stringField,
      booleanField: this.__booleanField,
      numberField: this.__numberField
    });
  }

}

type MyRecordUpdate = { stringField?: string;
  booleanField?: bool;
  numberField?: number;
  [key: string]: void;
};
type MyRecordInit = { stringField: string;
  booleanField: bool;
  numberField?: number;
  [key: string]: void;
};
export default MyRecord;
