import { DashboardPage } from "@/components/dashboard-page";
import { db } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardPageContent } from "./dashboard-content";
import { CreateEventCategoryModal } from "@/components/create-event-category-modal";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
export const runtime = 'edge';
const Page = async () => {

    const auth = await currentUser();
    if(!auth) {
        console.log("Redirected from auth")

        redirect("/sign-in");
    }

    let user = await db.user.findUnique({
        where: {
            externalId: auth.id
        }
    });

    if(!user) {
        console.log("Creating new user");
        user = await db.user.create({
            data: {
                quotaLimit: 100,
                email: auth.emailAddresses[0].emailAddress,
                externalId: auth.id,
            }
        });
    }

    // Get the categories count
    const categories = await db.eventCategory.findMany({
        where: { userId: user.id }
    });

    return (
       <>
        <DashboardPage cta={<CreateEventCategoryModal currentCategoryCount={categories.length} userPlan={user.plan}>
            <Button className="w-full sm:w-fit">
                <PlusIcon className="size-4 mr-2" />
                Add Category
            </Button>
        </CreateEventCategoryModal>} title="Dashboard">
            <DashboardPageContent />
        </DashboardPage>
       </>
    )
}
export default Page;