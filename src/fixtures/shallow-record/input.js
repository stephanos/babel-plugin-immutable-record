/* @flow */

import Record from '../decorator';

@Record('name')
class MyRecord {

  arrayField: string[] = [];
  stringField: string;
  booleanField: boolean;
  numberField: number = 42;
}

export default MyRecord;
