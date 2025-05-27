import { MailComponent } from './components/mail'
import { accounts, mails } from './data'

export default function MailPage() {
  return (
    <div className="h-[100vh]">
      <MailComponent
        accounts={accounts}
        mails={mails}
        // defaultLayout={defaultLayout}
        // defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
      />
    </div>
  )
}
