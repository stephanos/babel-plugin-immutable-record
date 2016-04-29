import Data from '../decorator';

import { Map } from 'immutable';

/*::`*/@Data()
/*::`;*/class MyRecord extends Data.Base {
  data: Map<string, any>;

  constructor(init: MyRecordInit | Map<string, any>) {
    super();

    if (Map.isMap(init)) {
      this.data = init;
    } else {
      this.data = Map({});
    }
  }

  update(update: MyRecordUpdate): MyRecord {
    return new MyRecord(this.data.merge(update));
  }

  toMap(): Map<string, any> {
    return this.data;
  }

}

type MyRecordUpdate = { [key: string]: void;
};
type MyRecordInit = { [key: string]: void;
};
export default MyRecord;
