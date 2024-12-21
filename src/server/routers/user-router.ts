import { router } from "../__internals/router"
import { privateProcedure } from "../procedures"
import { db } from "@/db"

export const userRouter = router({
  getCurrentUser: privateProcedure.query(async ({ c, ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        plan: true,
        quotaLimit: true,
        discordId: true,
      },
    })

    return c.json(user)
  }),
})