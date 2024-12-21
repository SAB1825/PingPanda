import { router } from "../__internals/router";
import { privateProcedure } from "../procedures";
import { z } from "zod";
import { lemonSqueezyApiInstance } from "@/lib/axios";

export const purchaseRouter = router({
  createCheckout: privateProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ c, ctx, input }) => {
      try {
        const { user } = ctx;
        

        if (!process.env.LEMON_SQUEEZY_API_KEY) {
          throw new Error('LEMON_SQUEEZY_API_KEY is not configured');
        }
        if (!process.env.LEMON_SQUEEZY_STORE_ID) {
          throw new Error('LEMON_SQUEEZY_STORE_ID is not configured');
        }

        console.log('Attempting checkout creation with:', {
          storeId: process.env.LEMON_SQUEEZY_STORE_ID,
          variantId: input.productId,
          userId: user.id,
          userEmail: user.email
        });

        const checkoutData = {
          data: {
            type: "checkouts",
            attributes: {
              custom_price: null,
              product_options: {
                enabled_variants: [input.productId],
              },
              checkout_data: {
                custom: {
                  user_id: user.id,
                  email: user.email,
                },
              },
              
            },
            relationships: {
              store: {
                data: {
                  type: "stores",
                  id: process.env.LEMON_SQUEEZY_STORE_ID.toString(),
                },
              },
              variant: {
                data: {
                  type: "variants",
                  id: input.productId,
                },
              },
            },
          },
        };

        console.log('Sending request to Lemon Squeezy:', JSON.stringify(checkoutData, null, 2));

        const response = await lemonSqueezyApiInstance.post("/checkouts", checkoutData);

        return c.json({
          checkoutUrl: response.data.data.attributes.url
        });
      } catch (error) {
        console.error('Detailed checkout error:', error);
        if (error instanceof Error && 'response' in error) {
          console.error('Lemon Squeezy error response:', {
            status: (error as any).response.status,
            data: (error as any).response.data
          });
        }
        
        throw new Error('Failed to create checkout');
      }
    }),
});