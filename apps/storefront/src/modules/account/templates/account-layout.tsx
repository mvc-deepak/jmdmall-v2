import React from "react"

import AccountRedirectGuard from "@modules/account/components/account-redirect-guard"
import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 py-8 md:py-12" data-testid="account-page">
      <AccountRedirectGuard />
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-white flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 py-8 md:py-12">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:border-t border-slate-200 py-8 md:py-12 gap-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Got questions?</h3>
            <span className="text-sm text-slate-600">
              You can find frequently asked questions and answers on our
              customer service page.
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              Customer Service
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
