import type { MockKey } from '@main/socket/croe/type'
import { zodResolver } from '@hookform/resolvers/zod'
import { normalizeMockKey } from '@main/socket/croe/util'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { Link } from 'react-router'

interface CreateServerFieldValues {
  type: 'socket' | 'websocket'
  name: string
}

const createServerSchema = z.object({
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
    const port = Number(val.name)
    if (!/^\d+$/.test(val.name) || port < 1 || port > 65535) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '端口号需为 1~65535 的数字',
        path: ['name'],
      })
    }
  }
})

export function SocketServerList() {
  const serverItems = useSocketStore(s => s.serverItems)
  const [open, setOpen] = useState(false)

  const [creating, setCreating] = useState(false)
  const [closing, setClosing] = useState<MockKey | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterKeyword, setFilterKeyword] = useState('')
  const filteredItems = useMemo(() => {
    return serverItems.filter((item) => {
      const { socketType, name } = normalizeMockKey(item.key)
      const typeMatch = filterType !== 'all' ? socketType === filterType : true
      const keywordMatch = filterKeyword ? name.includes(filterKeyword) : true
      return typeMatch && keywordMatch
    })
  }, [serverItems, filterType, filterKeyword])

  const form = useForm<CreateServerFieldValues>({
    resolver: zodResolver(createServerSchema),
    defaultValues: {
      type: 'websocket',
      name: '',
    },
    mode: 'onChange',
  })

  const handleCreate = async (values: CreateServerFieldValues) => {
    // 先同步校验
    const valid = await form.trigger()
    if (!valid)
      return
    setCreating(true)
    // 异步校验端口/管道是否被占用
    let err: Error | void
    if (values.type === 'socket') {
      err = await ipc.invoke.checkServer({ path: values.name })
      if (err) {
        form.setError('name', { message: '管道已存在' })
        setCreating(false)
        return
      }
    }
    else if (values.type === 'websocket') {
      const port = Number(values.name)
      err = await ipc.invoke.checkServer({ port })
      if (err) {
        console.debug(err)
        form.setError('name', { message: '端口已存在' })
        setCreating(false)
        return
      }
    }
    // 通过后再创建
    const key = (values.type === 'socket' ? `server:socket:${values.name}` : `server:websocket:${values.name}`) as MockKey<'server'>
    try {
      console.debug(key)
      ipc.send.createServer(key)
      setOpen(false)
      form.reset({ type: 'socket', name: '' })
    }
    finally {
      setCreating(false)
    }
  }

  const handleClose = async (key: MockKey<'server'>) => {
    setClosing(key)
    try {
      await ipc.send.closeServer(key)
      await useSocketStore.getState().updateServerItems()
    }
    finally {
      setClosing(null)
    }
  }

  const handleStart = async (key: MockKey<'server'>) => {
    // 启动服务逻辑
    await ipc.send.createServer(key)
    await useSocketStore.getState().updateServerItems()
  }

  const handleDelete = async (_key: MockKey<'server'>) => {
    // 删除服务逻辑
    // await ipc.invoke.deleteServer?.(key)
    await useSocketStore.getState().updateServerItems()
  }

  return (
    <div className="p-6 pt-0 flex flex-col h-[80vh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">服务列表</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>新建服务</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建服务</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(handleCreate)}
              >
                <DialogDescription>请选择类型并输入名称</DialogDescription>
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
                            placeholder={form.watch('type') === 'socket' ? '管道名，如： /tmp/socket' : '端口号，如： 8080'}
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

      {/* 筛选区域 */}
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
          placeholder="搜索标识/端口/管道名"
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
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">暂无服务</TableCell>
                  </TableRow>
                )
              : (
                  filteredItems.map((item) => {
                    const { socketType, name } = normalizeMockKey(item.key)
                    return (
                      <TableRow key={item.key}>
                        <TableCell>{socketType === 'socket' ? 'Socket' : 'WebSocket'}</TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClose(item.key as MockKey<'server'>)}
                            disabled={closing === item.key || !item.running}
                          >
                            {closing === item.key ? '关闭中...' : '关闭'}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleStart(item.key as MockKey<'server'>)}
                            disabled={item.running}
                          >
                            启动
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.key as MockKey<'server'>)}
                            disabled={item.running}
                          >
                            删除
                          </Button>
                          <Link to={`/server/${encodeURIComponent(item.key)}`}>
                            <Button size="sm" variant="secondary">详情</Button>
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
