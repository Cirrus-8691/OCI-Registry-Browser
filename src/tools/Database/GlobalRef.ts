export class GlobalRef<T> {
  private readonly sym: symbol;

  constructor(uniqueName: string) {
    this.sym = Symbol.for(uniqueName);
  }

  get value() : T | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (global as any)[this.sym] as T | undefined;
  }

  set value(value: T) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any)[this.sym] = value;
  }
}
