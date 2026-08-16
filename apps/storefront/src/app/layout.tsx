import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import JMDMALLHeader from "@modules/common/components/jmdmall-header"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <JMDMALLHeader />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
