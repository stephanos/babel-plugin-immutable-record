/* @flow */

function Record(): Function {
  return () => {};
}

class Base {}
Record.Base = Base;


export default Record;
