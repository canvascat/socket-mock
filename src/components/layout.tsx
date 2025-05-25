import React from 'react'
import { matchRoutes, useLocation } from 'react-router'
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import routes from '@/routes'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const matchedRoutes = matchRoutes(routes, location)
  const breadcrumbItems = matchedRoutes?.map(route => ({
    title: route.route.title,
    href: route.route.path,
  }))
  const currrentTitle = breadcrumbItems?.pop()?.title

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-[100vh] overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink to="/">
                    Socket Mock
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems?.map(item => (
                  <React.Fragment key={item.title}>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem key={item.title}>
                      {item.href ? <BreadcrumbLink to={item.href}>{item.title}</BreadcrumbLink> : <BreadcrumbPage>{item.title}</BreadcrumbPage>}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currrentTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
