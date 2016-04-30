/* @flow */

import Record from '../decorator';

import { List, Map } from 'immutable';

/*::`*/@Record('name')
/*::`;*/class MyRecord extends Record.Base {
  data: Map<string, any>;

  constructor(init: MyRecordInit | Map<string, any>) {
    super();

    if (init instanceof Map) {
      this.data = init;
    } else {
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
    return new MyRecord(this.data.merge(update));
  }

  toMap(): Map<string, any> {
    return this.data;
  }

}

type MyRecordUpdate = { arrayField?: string[];
  stringField?: string;
  booleanField?: bool;
  numberField?: number;
  [key: string]: void;
};
type MyRecordInit = { arrayField?: string[];
  stringField: string;
  booleanField: bool;
  numberField?: number;
  [key: string]: void;
};
export default MyRecord;
