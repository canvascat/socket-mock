import type { MockKey } from '@main/socket/core/type'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ipc } from '@/lib/electron'
import { useSocketStore } from '@/store'

export function SocketClientDetail() {
  const key = decodeURIComponent(useParams<{ id: string }>().id || '')
  const client = useSocketStore(s => s.clientItems.find(c => c.key === key))
  const logs = useSocketStore(s => s.clientItems.find(c => c.key === key)?.logs || [])
  const keyAsClientKey = key as MockKey<'client'>
  const [sending, setSending] = useState(false)
  const [msgType, setMsgType] = useState<'text' | 'json'>('text')
  const [msg, setMsg] = useState('')
  const logRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  // 操作
  const handleStart = async () => {
    await ipc.send.createClient(keyAsClientKey)
  }
  const handleConnect = async () => {
    await ipc.send.createClient(keyAsClientKey)
  }
  const handleDisconnect = async () => {
    await ipc.send.closeClient(keyAsClientKey)
  }
  const handleSend = async () => {
    setSending(true)
    try {
      ipc.send.send2server(keyAsClientKey, msg)
      setMsg('')
    }
    finally {
      setSending(false)
    }
  }

  const logText = logs.join('\n')

  return (
    <div className="p-6 pt-0 flex flex-col h-0 gap-4 flex-1 overflow-hidden">
      <Card className="flex-1 overflow-auto p-4 gap-2" ref={logRef}>
        <div className="text-base font-bold mb-2">
          日志
          {key}
        </div>
        <div className="text-xs whitespace-pre-line break-all flex-1 overflow-auto">
          {!logText ? <div className="text-muted-foreground">暂无日志</div> : <pre>{logText}</pre>}
        </div>
      </Card>
      <Card className="p-4 gap-2 flex flex-col">

        <div className="flex items-center gap-2 justify-between">
          <div className="flex gap-2">
            <Button size="sm" onClick={handleStart} disabled={client?.running}>启动</Button>
            <Button size="sm" onClick={handleConnect} disabled={client?.running}>连接</Button>
            <Button size="sm" onClick={handleDisconnect} disabled={!client?.running}>断开</Button>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">消息类型：</span>
              <Select value={msgType} onValueChange={v => setMsgType(v as 'text' | 'json')}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="请选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">文本</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSend} disabled={sending || !msg || !client?.running}>发送</Button>
          </div>
        </div>
        <div className="flex gap-2 items-end">
          <Textarea
            className="flex-1 min-h-[60px]"
            placeholder={msgType === 'text' ? '请输入要发送的文本消息' : '请输入要发送的 JSON'}
            value={msg}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMsg(e.target.value)}
            disabled={sending || !client?.running}
          />
        </div>
      </Card>
    </div>
  )
}
