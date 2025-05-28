import { MailComponent } from './components/mail'
import { accounts, mails } from './data'

export default function MailPage() {
  return (
    <div className="h-[100vh]">
      <MailComponent
        projects={accounts}
        mails={mails}
        // defaultLayout={defaultLayout}
        // defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
      />
    </div>
  )
}
