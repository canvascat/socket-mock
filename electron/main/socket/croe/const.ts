import process from 'node:process'

// windows 命名管道
// export const PIPE_NAME =  '//./pipe/agent_cli';

export const PIPE_NAME = process.platform === 'win32' ? '\\\\.\\pipe\\agent_cli' : '\0agent_cli'
