// https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/mocha/mocha.d.ts

declare interface MochaDone {
  (error?: Error): void;
}

declare interface ISuite {
  parent: ISuite;
  title: string;

  fullTitle(): string;
}

declare interface IRunnable {
  title: string;
  fn: Function;
  async: boolean;
  sync: boolean;
  timedOut: boolean;
}

declare interface ITest extends IRunnable {
  parent: ISuite;
  pending: boolean;

  fullTitle(): string;
}

declare interface ITestDefinition {
  (expectation: string, assertion?: () => void | Promise<any>): ITest;
  (expectation: string, assertion?: (done: MochaDone) => void): ITest;
  only(expectation: string, assertion?: () => void): ITest;
  only(expectation: string, assertion?: (done: MochaDone) => void): ITest;
  skip(expectation: string, assertion?: () => void): void;
  skip(expectation: string, assertion?: (done: MochaDone) => void): void;
  timeout(ms: number): void;
}

declare interface IContextDefinition {
  (description: string, spec: () => void): void;
  only(description: string, spec: () => void): void;
  skip(description: string, spec: () => void): void;
  timeout(ms: number): void;
}

declare function before(action: () => void): void;
declare function before(action: (done: MochaDone) => void): void;

declare function beforeEach(action: () => void): void;
declare function beforeEach(action: (done: MochaDone) => void): void;

declare function after(action: () => void): void;
declare function after(action: (done: MochaDone) => void): void;

declare function afterEach(action: () => void): void;
declare function afterEach(action: (done: MochaDone) => void): void;

declare var it: ITestDefinition;
declare var describe: IContextDefinition;
