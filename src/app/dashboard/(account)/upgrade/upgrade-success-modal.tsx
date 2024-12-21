import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction } from "react"

interface UpgradeSuccessModalProps {
  showModal: boolean
  setShowModal: Dispatch<SetStateAction<boolean>>
}

export const UpgradeSuccessModal = ({
  showModal,
  setShowModal,
}: UpgradeSuccessModalProps) => {
  const router = useRouter()

  return (
    <Modal showModal={showModal} setShowModal={setShowModal}>
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h2 className="text-xl font-semibold text-center">Upgrade Successful!</h2>
        <p className="text-center text-gray-600">
          Your account has been upgraded to PRO. You now have access to increased limits and premium features.
        </p>
        <Button
          onClick={() => {
            setShowModal(false)
            router.refresh() // Refresh the page to show updated limits
          }}
          className="w-full"
        >
          Got it
        </Button>
      </div>
    </Modal>
  )
}