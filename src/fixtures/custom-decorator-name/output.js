import Data from '../decorator';

import { Iterable, Map } from 'immutable';

function toMap(v) {
  if (v instanceof Iterable) {
    return v.map(toMap);
  }

  if (v instanceof Data.Base) {
    return v.toMap();
  }

  return v;
}

/*::`*/@Data()
/*::`;*/class MyRecord extends Data.Base {
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
