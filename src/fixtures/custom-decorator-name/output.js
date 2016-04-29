import Data from '../decorator';

import { Map } from 'immutable';

/*::`*/@Data()
/*::`;*/class MyRecord extends Data.Base {
  map: Map<string, any>;

  constructor(init: MyRecordInit | Map<string, any>) {
    super();

    if (init instanceof Map) {
      this.map = init;
    } else {
      this.map = Map({});
    }
  }

  update(update: MyRecordUpdate): MyRecord {
    return new MyRecord(this.map.merge(update));
  }

  toMap(): Map<string, any> {
    return this.map;
  }

}

type MyRecordUpdate = { [key: string]: void;
};
type MyRecordInit = { [key: string]: void;
};
export default MyRecord;
