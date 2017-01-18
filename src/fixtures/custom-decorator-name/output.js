import Data from '../decorator';

import { Iterable, Map } from 'immutable';

function toMap(v): any {
  if (v instanceof Iterable) {
    return v.map(toMap);
  }

  if (v instanceof Data.Base) {
    return v.toMap();
  }

  return v;
}

@Data()
class MyRecord extends Data.Base {
  data: Map<string, any>;

  constructor(init: MyRecordInit) {
    super();

    if (init) {
      this.data = Map({});
    }
  }

  update(update: MyRecordUpdate): MyRecord {
    const updated = Object.create(MyRecord.prototype);
    updated.data = this.data.merge(Map(update));
    return updated;
  }

  toMap(): Map<string, any> {
    return toMap(this.data);
  }

}

type MyRecordUpdate = {
  [key: string]: void;
};
type MyRecordInit = {
  [key: string]: void;
};
export default MyRecord;
