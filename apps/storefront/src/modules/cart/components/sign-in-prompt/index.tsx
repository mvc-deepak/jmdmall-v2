import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <Heading level="h2" className="text-lg font-semibold text-slate-900">
          Already have an account?
        </Heading>
        <Text className="mt-1 text-sm text-slate-600">
          Sign in for faster checkout and saved details.
        </Text>
      </div>
      <div>
        <LocalizedClientLink
          href="/account"
          className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 transition hover:border-emerald-600 hover:text-emerald-700"
          data-testid="sign-in-button"
        >
          Sign in
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
