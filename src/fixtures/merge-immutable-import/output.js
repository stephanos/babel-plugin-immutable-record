import Record from '../decorator';

import { Iterable, Map, Set } from 'immutable';

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
      this.data = Map({});
    }
  }

  update(update: MyRecordUpdate): MyRecord {
    return new MyRecord(this.data.merge(update));
  }

  toMap(): Map<string, any> {
    return toMap(this.data);
  }

}

type MyRecordUpdate = { [key: string]: void;
};
type MyRecordInit = { [key: string]: void;
};
export default MyRecord;
