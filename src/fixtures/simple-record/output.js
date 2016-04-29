/* @flow */

import Record from '../decorator';

import { Map } from 'immutable';

/*::`*/@Record('name')
/*::`;*/class MyRecord extends Record.Base {
  data: Map<string, any>;

  constructor(init: MyRecordInit | Map<string, any>) {
    super();

    if (init instanceof Map) {
      this.data = init;
    } else {
      this.data = Map({
        stringField: init.stringField,
        booleanField: init.booleanField,
        numberField: init.numberField || 42
      });
    }
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
    return new MyRecord(this.data.merge(update));
  }

  toMap(): Map<string, any> {
    return this.data;
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
