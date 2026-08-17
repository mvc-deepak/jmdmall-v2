import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "../localized-client-link"
type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  className,
  style,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className={className ? `flex gap-x-1 items-center group ${className}` : "flex gap-x-1 items-center group"}
      href={href}
      onClick={onClick}
      style={style}
      {...props}
    >
      <Text className="text-ui-fg-interactive">{children}</Text>
      <ArrowUpRightMini
        className="group-hover:rotate-45 ease-in-out duration-150"
        color="var(--fg-interactive)"
      />
    </LocalizedClientLink>
  )
}

export default InteractiveLink
