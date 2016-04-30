/* @flow */

import Record from '../decorator';
import { List, Iterable, Map } from 'immutable';
import ShallowRecord from '../shallow-record/output';

function toMap(v) {
  if (v instanceof Iterable) {
    return v.map(toMap);
  }

  if (v instanceof Record.Base) {
    return v.toMap();
  }

  return v;
}

/*::`*/@Record()
/*::`;*/class MyRecord extends Record.Base {
  data: Map<string, any>;

  constructor(init: MyRecordInit | Map<string, any>) {
    super();

    if (init instanceof Map) {
      this.data = init;
    } else {
      this.data = Map({
        recordField: init.recordField,
        recordsField: List(init.recordsField)
      });
    }
  }

  get recordField(): ShallowRecord {
    return this.data.get('recordField');
  }

  get recordsField(): List<ShallowRecord> {
    return this.data.get('recordsField');
  }

  update(update: MyRecordUpdate): MyRecord {
    return new MyRecord(this.data.merge(update));
  }

  toMap(): Map<string, any> {
    return toMap(this.data);
  }

}

type MyRecordUpdate = { recordField?: ShallowRecord;
  recordsField?: ShallowRecord[];
  [key: string]: void;
};
type MyRecordInit = { recordField: ShallowRecord;
  recordsField: ShallowRecord[];
  [key: string]: void;
};
export default MyRecord;
