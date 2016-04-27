import { Map } from "immutable";

class MyData extends Data.Base {
  constructor(init: MyDataInit) {
    super();
    this.__myProperty = init.myProperty;
  }

  __myProperty: any;

  get myProperty(): any {
    return this.__myProperty;
  }

  update(update: MyDataUpdate): MyData {
    return new MyData({
      myProperty: update.myProperty || this.__myProperty
    });
  }

  toMap(): Map<string, any> {
    return Map({
      myProperty: this.__myProperty instanceof Data.Base ? this.__myProperty.toMap() : this.__myProperty
    });
  }

}

type MyDataUpdate = { myProperty?: any;
  [key: string]: void;
};
type MyDataInit = { myProperty: any;
  [key: string]: void;
};
Data()(MyData);
export default MyData;
