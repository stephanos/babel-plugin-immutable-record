/* @flow */

import Record from '../decorator';

@Record('name')
class MyRecord {

  stringField: string;
  booleanField: boolean;
  numberField: number = 42;
}

export default MyRecord;
