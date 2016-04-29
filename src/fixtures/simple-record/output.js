/* @flow */

import Record from '../decorator';

import { Map } from 'immutable';

/*::`*/@Record('name')
/*::`;*/class MyRecord extends Record.Base {
  map: Map<string, any>;

  constructor(init: MyRecordInit | Map<string, any>) {
    super();

    if (init instanceof Map) {
      this.map = init;
    } else {
      this.map = Map({
        stringField: init.stringField,
        booleanField: init.booleanField,
        numberField: init.numberField || 42
      });
    }
  }

  get stringField(): string {
    return this.map.get('stringField');
  }

  get booleanField(): bool {
    return this.map.get('booleanField');
  }

  get numberField(): number {
    return this.map.get('numberField');
  }

  update(update: MyRecordUpdate): MyRecord {
    return new MyRecord(this.map.merge(update));
  }

  toMap(): Map<string, any> {
    return this.map;
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
