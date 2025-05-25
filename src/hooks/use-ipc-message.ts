import type { IPCSendMesssageType } from '@main/socket/manager'
import { useEffect, useRef } from 'react'
import { ipc } from '@/lib/electron'

export function useIpcMessage(onMessage: (message: IPCSendMesssageType) => void) {
  const listener = useRef(onMessage)
  listener.current = onMessage

  useEffect(() => {
    const subscription = ipc.subscribe(message => listener.current(message))
    return () => subscription.unsubscribe()
  }, [])
}
