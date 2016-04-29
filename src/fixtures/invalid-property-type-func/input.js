import Record from '../decorator';

@Record()
class MyRecord {

  funcField: (x: number) => string;
}

export default MyRecord;
