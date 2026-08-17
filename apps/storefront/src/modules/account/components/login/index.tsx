import { login } from "@lib/data/customer"
import { useCart } from "@lib/hooks/useCart"
import { useWishlist } from "@lib/hooks/useWishlist"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useActionState, useEffect } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const { syncFromServer: syncCartFromServer } = useCart()
  const { syncFromServer: syncWishlistFromServer } = useWishlist()
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectTo =
    searchParams.get("redirect") ??
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect")
      : null)

  useEffect(() => {
    if (message?.state !== "success") {
      return
    }

    Promise.all([syncCartFromServer(), syncWishlistFromServer()])
      .catch(() => {
        // Ignore sync failures here; the guest data remains available locally.
      })
      .finally(() => {
        if (redirectTo) {
          try {
            const targetUrl = decodeURIComponent(redirectTo)
            router.replace(targetUrl)
            return
          } catch (error) {
            console.error("Failed to redirect:", error)
          }
        }

        router.replace("/")
      })
  }, [message?.state, redirectTo, router, syncCartFromServer, syncWishlistFromServer])

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Sign in to access an enhanced shopping experience.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-6 text-center text-base-regular text-ui-fg-base bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4"
          data-testid="login-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please verify your email, then sign in.
        </div>
      )}
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          Sign in
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default Login
