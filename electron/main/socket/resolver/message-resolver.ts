import Logger from 'electron-log'

export abstract class MessageResolver {
  protected readonly logger = Logger.scope(this.constructor.name)

  abstract output: (data: any, callback: (content: string) => void) => void

  abstract input: (content: string) => any
}
