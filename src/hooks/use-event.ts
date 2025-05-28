import type { ClientMessageType, IPCSendMesssageType, ServerMessageType } from '@main/socket'
import { useEffect, useRef } from 'react'
import { filter } from 'rxjs'
import * as rpc from '@/lib/rpc'

const isClientMessage = (message: IPCSendMesssageType): message is ClientMessageType => message.type.startsWith('client:')
const isServerMessage = (message: IPCSendMesssageType): message is ServerMessageType => message.type.startsWith('server:')

export function useEvent(listener: (message: IPCSendMesssageType) => void) {
  const fn = useRef(listener)
  fn.current = listener

  useEffect(() => {
    rpc.event.pipe(filter(data => data.type === 'client:message')).subscribe(message => fn.current(message))
    const sub = rpc.event.subscribe(message => fn.current(message))
    return sub.unsubscribe
  }, [])
}

export function useClientEvent(listener: (message: ClientMessageType) => void) {
  const fn = useRef(listener)
  fn.current = listener

  useEffect(() => {
    const sub = rpc.event.pipe(filter(data => isClientMessage(data))).subscribe(message => fn.current(message))
    return sub.unsubscribe
  }, [])
}

export function useServerEvent(listener: (message: ServerMessageType) => void) {
  const fn = useRef(listener)
  fn.current = listener

  useEffect(() => {
    const sub = rpc.event.pipe(filter(data => isServerMessage(data))).subscribe(message => fn.current(message))
    return sub.unsubscribe
  }, [])
}
