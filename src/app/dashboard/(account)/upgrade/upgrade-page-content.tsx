"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { UpgradeSuccessModal } from "./upgrade-success-modal"
import { Card } from "@/components/ui/card"
import { client } from "@/lib/client"
import { Plan } from "@prisma/client"
import { useMutation, useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { BarChart, TriangleAlert } from "lucide-react"
import { useRouter } from "next/navigation"

export const UpgradePageContent = ({ plan }: { plan: Plan }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const fromCategoryLimit = searchParams.get('from') === 'category_limit'

  // Check for upgrade success parameter
  useEffect(() => {
    if (searchParams.get("upgrade") === "success") {
      setShowSuccessModal(true)
      // Clean up the URL
      router.replace("/dashboard/upgrade", { scroll: false })
    }
  }, [searchParams, router])

  const { mutate: createCheckout, isPending, error } = useMutation({
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
      window.location.href = data.checkoutUrl
    },
    onError: (error) => {
      console.error('Checkout creation failed:', error)
      // Optionally add a toast or alert here to show the error to the user
    }
  })

  const { data: usageData } = useQuery({
    queryKey: ["usage"],
    queryFn: async () => {
      const res = await client.project.getUsage.$get()
      return await res.json()
    },
  })

  return (
    <>
      <div className="max-w-3xl flex flex-col gap-8">
        {fromCategoryLimit && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <TriangleAlert className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You&apos;ve reached the maximum number of categories for the free plan. 
                  Upgrade to Pro to create unlimited categories!
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <h1 className="mt-2 text-xl/8 font-medium tracking-tight text-gray-900">
            {plan === "PRO" ? "Plan: Pro" : "Plan: Free"}
          </h1>
          <p className="text-sm/6 text-gray-600 max-w-prose">
            {plan === "PRO"
              ? "Thank you for supporting PingPanda. Find your increased usage limits below."
              : "Get access to more events, categories and premium support."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-brand-700">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm/6 font-medium">Total Events</p>
              <BarChart className="size-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-2xl font-bold">
                {usageData?.eventsUsed || 0} of{" "}
                {usageData?.eventsLimit.toLocaleString() || 100}
              </p>
              <p className="text-xs/5 text-muted-foreground">
                Events this period
              </p>
            </div>
          </Card>
          <Card>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm/6 font-medium">Event Categories</p>
              <BarChart className="size-4 text-muted-foreground" />
            </div>

            <div>
              <p className="text-2xl font-bold">
                {usageData?.categoriesUsed || 0} of{" "}
                {usageData?.categoriesLimit.toLocaleString() || 10}
              </p>
              <p className="text-xs/5 text-muted-foreground">Active categories</p>
            </div>
          </Card>
        </div>

        <p className="text-sm text-gray-500">
          Usage will reset{" "}
          {usageData?.resetDate ? (
            format(usageData.resetDate, "MMM d, yyyy")
          ) : (
            <span className="animate-pulse w-8 h-4 bg-gray-200"></span>
          )}
          {plan !== "PRO" ? (
            <span
              onClick={() => createCheckout()}
              className="inline cursor-pointer underline text-brand-600"
            >
              {isPending ? "Loading..." : " or upgrade now to increase your limit →"}
            </span>
          ) : null}
        </p>
      </div>

      <UpgradeSuccessModal 
        showModal={showSuccessModal} 
        setShowModal={setShowSuccessModal} 
      />
    </>
  )
}