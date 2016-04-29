import Data from '../decorator';

import { Map } from 'immutable';

/*::`*/@Data()
/*::`;*/class MyRecord extends Data.Base {
  constructor(init: MyRecordInit) {
    super();
  }

  update(update: MyRecordUpdate): MyRecord {
    return new MyRecord({});
  }

  toMap(): Map<string, any> {
    return Map({});
  }

}

type MyRecordUpdate = { [key: string]: void;
};
type MyRecordInit = { [key: string]: void;
};
export default MyRecord;
