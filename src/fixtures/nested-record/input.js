/* @flow */

import Record from '../decorator';
import ShallowRecord from '../shallow-record/output';

@Record()
class MyRecord {

  recordField: ShallowRecord;
  recordsField: ShallowRecord[];
}

export default MyRecord;
