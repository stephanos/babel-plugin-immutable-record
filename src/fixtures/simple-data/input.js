/* @flow */

import Data from '../decorator';

@Data('name')
class MyData {

  stringField: string;
  booleanField: boolean;
  numberField: number = 42;
}

export default MyData;
