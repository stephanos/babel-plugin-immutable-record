import Record from '../decorator';

@Record()
class MyRecord {

  _invalidName: string;
}

export default MyRecord;
