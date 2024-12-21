import { Hono } from "hono";
import { db } from "@/db";
import { Plan } from "@prisma/client";
import { PRO_QUOTA } from "@/config";

const webhookRouter = new Hono()

webhookRouter.post("/", async (c) => {
  try {
    const payload = await c.req.json();
    console.log("Webhook received:", payload);

    if (
      payload.meta.event_name === "order_created" && 
      payload.data.attributes.status === "paid"
    ) {
      const userId = payload.meta.custom_data.user_id;

      console.log("Upgrading user:", userId);

     
      await db.user.update({
        where: { id: userId },
        data: {
          plan: Plan.PRO,
          quotaLimit: PRO_QUOTA.maxEventsPerMonth,
        },
      });

      console.log(`User ${userId} upgraded to PRO plan successfully`);
      return c.json({ success: true });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

export { webhookRouter };