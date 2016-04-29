import Record from '../decorator';

@Record()
class MyRecord {

  objectField: {a: string};
}

export default MyRecord;
