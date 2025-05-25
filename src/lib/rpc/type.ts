type AnyFn = (...args: any[]) => any
type PromisifyFn<T extends AnyFn> = ReturnType<T> extends Promise<any>
  ? T
  : (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>

export type RPCFn<T extends AnyFn, M extends 'invoke' | 'send'> = M extends 'invoke' ? PromisifyFn<T> : (...args: Parameters<T>) => void

export type RPCFunctions<T, M extends 'invoke' | 'send'> = T extends ((...args: any[]) => any) ? Readonly<RPCFn<T, M>> : Readonly<{
  [K in keyof T]: RPCFunctions<T[K], M>
}>
