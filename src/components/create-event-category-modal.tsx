"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PropsWithChildren, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CATEGORY_NAME_VALIDATOR } from "@/lib/validators/category-validator"
import { Modal } from "./ui/modal"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { client } from "@/lib/client"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Plan } from "@prisma/client"
import { FREE_QUOTA, PRO_QUOTA } from "@/config"
import { LockIcon } from "lucide-react"
import { DialogTitle } from "./ui/dialog"

const EVENT_CATEGORY_VALIDATOR = z.object({
  name: CATEGORY_NAME_VALIDATOR,
  color: z
    .string()
    .min(1, "Color is required")
    .regex(/^#[0-9A-F]{6}$/i, "Invalid color format."),
  emoji: z.string().emoji("Invalid emoji").optional(),
})

type EventCategoryForm = z.infer<typeof EVENT_CATEGORY_VALIDATOR>

const COLOR_OPTIONS = [
  "#FF6B6B", // bg-[#FF6B6B] ring-[#FF6B6B] Bright Red
  "#4ECDC4", // bg-[#4ECDC4] ring-[#4ECDC4] Teal
  "#45B7D1", // bg-[#45B7D1] ring-[#45B7D1] Sky Blue
  "#FFA07A", // bg-[#FFA07A] ring-[#FFA07A] Light Salmon
  "#98D8C8", // bg-[#98D8C8] ring-[#98D8C8] Seafoam Green
  "#FDCB6E", // bg-[#FDCB6E] ring-[#FDCB6E] Mustard Yellow
  "#6C5CE7", // bg-[#6C5CE7] ring-[#6C5CE7] Soft Purple
  "#FF85A2", // bg-[#FF85A2] ring-[#FF85A2] Pink
  "#2ECC71", // bg-[#2ECC71] ring-[#2ECC71] Emerald Green
  "#E17055", // bg-[#E17055] ring-[#E17055] Terracotta
]

const EMOJI_OPTIONS = [
  { emoji: "💰", label: "Money (Sale)" },
  { emoji: "👤", label: "User (Sign-up)" },
  { emoji: "🎉", label: "Celebration" },
  { emoji: "📅", label: "Calendar" },
  { emoji: "🚀", label: "Launch" },
  { emoji: "📢", label: "Announcement" },
  { emoji: "🎓", label: "Graduation" },
  { emoji: "🏆", label: "Achievement" },
  { emoji: "💡", label: "Idea" },
  { emoji: "🔔", label: "Notification" },
]

interface CreateEventCategoryModel extends PropsWithChildren {
  containerClassName?: string
  currentCategoryCount: number
  userPlan: Plan
}

export const CreateEventCategoryModal = ({
  children,
  containerClassName,
  currentCategoryCount,
  userPlan,
}: CreateEventCategoryModel) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const queryClient = useQueryClient()
  const router = useRouter()

  const handleClick = () => {
    console.log('Current count:', currentCategoryCount); // Debug log
    console.log('User plan:', userPlan); // Debug log
    
    const categoryLimit = userPlan === Plan.PRO 
      ? PRO_QUOTA.maxEventCategories 
      : FREE_QUOTA.maxEventCategories;

    console.log('Category limit:', categoryLimit); // Debug log

    if (currentCategoryCount >= categoryLimit) {
      console.log('Showing upgrade modal'); // Debug log
      setShowUpgradeModal(true)
    } else {
      console.log('Showing create modal'); // Debug log
      setIsOpen(true)
    }
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EventCategoryForm>({
    resolver: zodResolver(EVENT_CATEGORY_VALIDATOR),
  })

 const {mutate : createEventCategory, isPending} = useMutation({
    mutationFn: async (data: EventCategoryForm) => {
      const response = await client.category.createCategory.$post(data)
      if (!response.ok) {
        const error = await response.json()
        throw new Error("error in ")
      }
      return response.json()
    },
    onSuccess: () => {
        queryClient.invalidateQueries({queryKey:["user-event-categories"]})
        setIsOpen(false)
        reset()
    },
    onError: (error) => {
      if (error.message?.includes("Category limit reached")) {
        setIsOpen(false)
        router.push("/dashboard/upgrade?from=category_limit")
      }
    }
 })


  const color = watch("color")
  const selectedEmoji = watch("emoji")

  const onSubmit = (data: EventCategoryForm) => {
    createEventCategory(data)
    
  }

  return (
    <>
      <div className={containerClassName} onClick={handleClick}>
        {children}
      </div>

      <Modal
        showModal={showUpgradeModal}
        setShowModal={setShowUpgradeModal}
        className="max-w-xl p-8"
      >
        <DialogTitle className="sr-only">Upgrade to Pro</DialogTitle>
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="p-3 bg-brand-50 rounded-full">
            <LockIcon className="w-6 h-6 text-brand-600" />
          </div>
          <h2 className="text-xl font-semibold">Category Limit Reached</h2>
          <p className="text-gray-600">
            You&apos;ve reached the maximum of {FREE_QUOTA.maxEventCategories} categories on the free plan. 
            Upgrade to Pro to create up to {PRO_QUOTA.maxEventCategories} categories!
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowUpgradeModal(false)
                router.push("/dashboard/upgrade?from=category_limit")
              }}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        className="max-w-xl p-8"
        showModal={isOpen}
        setShowModal={setIsOpen}
      >
        <DialogTitle className="sr-only">Create New Category</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="text-lg/7 font-medium tracking-tight text-gray-950">
              New Event Category
            </h2>
            <p className="text-sm/6 text-gray-600">
              Create a new category to organize your events.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                autoFocus
                id="name"
                {...register("name")}
                placeholder="e.g. user-signup"
                className="w-full"
              />
              {errors.name ? (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((preMadeColor) => (
                  <button
                    key={preMadeColor}
                    type="button"
                    className={cn(
                      `bg-[${preMadeColor}]`,
                      "size-10 rounded-full ring-2 ring-offset-2 transition-all",
                      color === preMadeColor
                        ? "ring-brand-700 scale-110"
                        : "ring-transparent hover:scale-105"
                    )}
                    onClick={() => setValue("color", preMadeColor)}
                  ></button>
                ))}
              </div>

              {errors.color ? (
                <p className="mt-1 text-sm text-red-500">
                  {errors.color.message}
                </p>
              ) : null}
            </div>

            <div>
              <Label>Emoji</Label>
              <div className="flex flex-wrap gap-3">
                {EMOJI_OPTIONS.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    type="button"
                    className={cn(
                      "size-10 flex items-center justify-center text-xl rounded-md transition-all",
                      selectedEmoji === emoji
                        ? "bg-brand-100 ring-2 ring-brand-700 scale-110"
                        : "bg-brand-100 hover:bg-brand-200"
                    )}
                    onClick={() => setValue("emoji", emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {errors.emoji ? (
                <p className="mt-1 text-sm text-red-500">
                  {errors.emoji.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Creating..." : "Create Category"}{" "}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}