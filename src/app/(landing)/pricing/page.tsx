"use client"

import { Heading } from "@/components/heading"
import { MaxWidthWrapper } from "@/components/max-width-wrapper"
import { Button } from "@/components/ui/button"
import { client } from "@/lib/client"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "@tanstack/react-query"
import { CheckIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { FREE_QUOTA, PRO_QUOTA } from "@/config"
export const runtime = 'edge';
const Page = () => {
  const { user } = useUser()
  const router = useRouter()

  const INCLUDED_FEATURES = [
    `${PRO_QUOTA.maxEventsPerMonth.toLocaleString()} events per month`,
    `${PRO_QUOTA.maxEventCategories} event categories`,
    "Advanced analytics and insights",
    "Priority support",
    "Lifetime access",
  ]

  const FREE_FEATURES = [
    `${FREE_QUOTA.maxEventsPerMonth.toLocaleString()} events per month`,
    `${FREE_QUOTA.maxEventCategories} event categories`,
    "Basic analytics",
    "Community support",
  ]

  const { mutate: createCheckout, isPending } = useMutation({
    mutationFn: async () => {
      const res = await client.purchase.createCheckout.$post({
        productId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRO_VARIANT_ID || "",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error('Failed to create checkout')
      }
      return res.json()
    },
    onSuccess: (data) => {
      // Redirect to Lemon Squeezy checkout
      window.location.href = data.checkoutUrl
    },
    onError: (error) => {
      console.error('Checkout creation failed:', error)
      // Optionally add error handling UI here
    }
  })

  const handleGetAccess = () => {
    if (!user) {
      router.push("/sign-in?intent=upgrade")
      return
    }
    createCheckout()
  }

  return (
    <div className="bg-brand-25 py-24 sm:py-32">
      <MaxWidthWrapper>
        <div className="mx-auto max-w-2xl sm:text-center">
          <Heading className="text-center">Simple no-tricks pricing</Heading>
          <p className="mt-6 text-base/7 text-gray-600 max-w-prose text-center text-pretty">
            We hate subscriptions. And chances are, you do too. That&apos;s why we
            offer lifetime access to PingPanda for a one-time payment.
          </p>
        </div>

        <div className="bg-white mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-3xl font-heading font-semibold tracking-tight text-gray-900">
              Lifetime access
            </h3>

            <p className="mt-6 text-base/7 text-gray-600">
              Invest once in PingPanda and transform how you monitor your SaaS
              forever. Get instant alerts, track critical metrics and never miss
              a beat in your business growth.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-brand-600">
                What&apos;s included
              </h4>
              <div className="h-px flex-auto bg-gray-100" />
            </div>

            <ul className="mt-8 grid grid-cols-1 gap-4 text-sm/6 text-gray-600 sm:grid-cols-2 sm:gap-6">
              {INCLUDED_FEATURES.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <CheckIcon className="h-6 w-5 flex-none text-brand-700" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs py-8">
                <p className="text-base font-semibold text-gray-600">
                  Pay once, own forever
                </p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    $49
                  </span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                    USD
                  </span>
                </p>

                <Button onClick={handleGetAccess} className="mt-6 px-20">
                  Get PingPanda
                </Button>
                <p className="mt-6 text-xs leading-5 text-gray-600">
                  Secure payment. Start monitoring in minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}

export default Page