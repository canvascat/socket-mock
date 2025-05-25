import type { MockKey } from '@main/socket/croe/type'
import { zodResolver } from '@hookform/resolvers/zod'
import { normalizeMockKey } from '@main/socket/croe/util'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ipc } from '@/lib/electron'
import { useSocketStore } from '@/store'

interface CreateClientFieldValues {
  type: 'socket' | 'websocket'
  name: string
}

const createClientSchema = z.object({
  type: z.enum(['socket', 'websocket'], { required_error: '请选择类型' }),
  name: z.string().min(1, '请输入'),
}).superRefine((val, ctx) => {
  if (val.type === 'socket') {
    if (!val.name.startsWith('/')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '管道名需以 / 开头，如：/tmp/socket',
        path: ['name'],
      })
    }
  }
  else if (val.type === 'websocket') {
    // 允许 ws://host:port 或 ws://ip:port
    if (!/^ws:\/\/.+:\d+$/.test(val.name)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '格式如 ws://127.0.0.1:8080',
        path: ['name'],
      })
    }
  }
})

export function SocketClientList() {
  const clientItems = useSocketStore(s => s.clientItems)
  const [closing, setClosing] = useState<MockKey | null>(null)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterKeyword, setFilterKeyword] = useState('')

  const form = useForm<CreateClientFieldValues>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      type: 'websocket',
      name: '',
    },
    mode: 'onChange',
  })

  const filteredItems = useMemo(() => {
    return clientItems.filter((item) => {
      const { socketType, name } = normalizeMockKey(item.key)
      const typeMatch = filterType !== 'all' ? socketType === filterType : true
      const keywordMatch = filterKeyword ? name.includes(filterKeyword) : true
      return typeMatch && keywordMatch
    })
  }, [clientItems, filterType, filterKeyword])

  const handleStart = async (key: MockKey<'client'>) => {
    await ipc.send.createClient(key)
    await useSocketStore.getState().updateClientItems()
  }
  const handleClose = async (key: MockKey<'client'>) => {
    setClosing(key)
    try {
      await ipc.send.closeClient(key)
      await useSocketStore.getState().updateClientItems()
    }
    finally {
      setClosing(null)
    }
  }
  const handleDelete = async (_key: MockKey<'client'>) => {
    // await ipc.invoke.deleteClient?.(key)
    await useSocketStore.getState().updateClientItems()
  }
  const handleCreate = async (values: CreateClientFieldValues) => {
    setCreating(true)
    try {
      ipc.send.createClient(`client:${values.type}:${values.name}`)
      setOpen(false)
      form.reset({ type: 'websocket', name: '' })
      await useSocketStore.getState().updateClientItems()
    }
    finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 pt-0 flex flex-col h-[80vh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">客户端列表</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>新建客户端</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建客户端</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-4 mt-6"
                onSubmit={form.handleSubmit(handleCreate)}
              >
                <DialogDescription>请选择类型并输入标识</DialogDescription>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="w-40">
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={creating}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="请选择类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="socket">Socket</SelectItem>
                              <SelectItem value="websocket">WebSocket</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder={form.watch('type') === 'socket' ? '管道名，如：/tmp/socket' : 'ws://127.0.0.1:8080'}
                            {...field}
                            disabled={creating}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit" disabled={creating || !form.formState.isValid}>
                    {creating ? '创建中...' : '创建'}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">取消</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-2 mb-2">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="全部类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="socket">Socket</SelectItem>
            <SelectItem value="websocket">WebSocket</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="flex-1"
          placeholder="搜索标识/地址"
          value={filterKeyword}
          onChange={e => setFilterKeyword(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>类型</TableHead>
              <TableHead>标识</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">暂无客户端</TableCell>
                  </TableRow>
                )
              : (
                  filteredItems.map((item) => {
                    const { socketType, name } = normalizeMockKey(item.key)
                    return (
                      <TableRow key={item.key}>
                        <TableCell>{socketType}</TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleStart(item.key as MockKey<'client'>)}
                            disabled={item.running}
                          >
                            启动
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClose(item.key as MockKey<'client'>)}
                            disabled={closing === item.key || !item.running}
                          >
                            {closing === item.key ? '关闭中...' : '关闭'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.key as MockKey<'client'>)}
                            disabled={item.running}
                          >
                            删除
                          </Button>
                          <Link to={`/client/${encodeURIComponent(item.key)}`}>
                            <Button size="sm" variant="outline">
                              详情
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
