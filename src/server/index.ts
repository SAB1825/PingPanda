import { Hono } from "hono"
import { cors } from "hono/cors"
import { handle } from "hono/vercel"
import { authRouter } from "./routers/auth-router"
import { CategoryRouter } from "./routers/category-router"
import { projectRouter } from "./routers/project-router"
import { purchaseRouter } from "./routers/purchase-router"
import { webhookRouter } from "./routers/webhook-router"
import { userRouter } from "./routers/user-router"

const app = new Hono().basePath("/api")

// Add webhook route WITHOUT CORS
app.route("/webhook", webhookRouter)

// Add CORS for other routes
app.use(cors())

const appRouter = app
    .route("/auth", authRouter)
    .route("/category", CategoryRouter)
    .route("/project", projectRouter)
    .route("/purchase", purchaseRouter)
    .route("/user", userRouter)

export const httpHandler = handle(app)
export default app
export type AppType = typeof appRouter
