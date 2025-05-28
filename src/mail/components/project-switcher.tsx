'use client'

import * as React from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface IProject {
  label: string
  value: string
  icon: React.ReactNode
}

interface ProjectSwitcherProps {
  isCollapsed: boolean
  projects: IProject[]
}

/** project */
export function ProjectSwitcher({
  isCollapsed,
  projects,
}: ProjectSwitcherProps) {
  const [selectedAccount, setSelectedAccount] = React.useState<string>(
    projects[0].value,
  )

  return (
    <Select defaultValue={selectedAccount} onValueChange={setSelectedAccount}>
      <SelectTrigger
        className={cn(
          'flex items-center w-full gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
          isCollapsed
          && 'flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden',
        )}
        aria-label="Select account"
      >
        <SelectValue placeholder="Select an account">
          {projects.find(account => account.value === selectedAccount)?.icon}
          <span className={cn('ml-2', isCollapsed && 'hidden')}>
            {
              projects.find(account => account.value === selectedAccount)
                ?.label
            }
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {projects.map(account => (
          <SelectItem key={account.value} value={account.value}>
            <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
              {account.icon}
              {account.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
