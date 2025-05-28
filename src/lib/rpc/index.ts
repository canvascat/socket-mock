import type { IPCInvokeMap, IPCSendMesssageType } from '@main/socket'
import { fromEvent } from 'rxjs'
import { createFlatProxy, createRecursiveProxy } from './createProxy'

type AnyFn = (...args: any[]) => any
type PromisifyFn<T extends AnyFn> = ReturnType<T> extends Promise<any>
  ? T
  : (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>

type RPCFn<T extends AnyFn, M extends 'invoke' | 'send'> = M extends 'invoke' ? PromisifyFn<T> : (...args: Parameters<T>) => void

type RPCFunctions<T, M extends 'invoke' | 'send'> = T extends ((...args: any[]) => any) ? RPCFn<T, M> : Readonly<{
  [K in keyof T]: RPCFunctions<T[K], M>
}>

function createRpc<RemoteFunctions, M extends 'invoke' | 'send'>(method: M, functions: object = {}) {
  const createCall = (path: string[]) => {
    if (method === 'send') {
      const sendEvent = (...args: any[]) => {
        window.ipcRenderer.send('ipc:on', {
          type: path.join('.'),
          args,
        })
      }
      return sendEvent
    }

    const sendCall = async (...args: any[]) => {
      return window.ipcRenderer.invoke('ipc:invoke', {
        type: path.join('.'),
        args,
      })
    }
    return sendCall
  }
  const proxy = createRecursiveProxy<RPCFunctions<RemoteFunctions, M>>(
    ({ path, args }) => {
      const pathCopy = [...path]

      return createCall(pathCopy)(...args)
    },
  )

  const rpc = createFlatProxy<RPCFunctions<RemoteFunctions, M>>((method) => {
    if (method === '$close')
      return close

    // catch if "createBirpc" is returned from async function
    if (method === 'then' && !('then' in functions))
      return undefined
    return proxy[method]
  })

  return rpc
}

export const invoke = createRpc<IPCInvokeMap, 'invoke'>('invoke')

export const event = fromEvent<IPCSendMesssageType>(window.ipcRenderer, 'ipc-message', (_event, message) => message)
