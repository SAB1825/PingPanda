import { z } from "zod";

export const CATEGORY_NAME_VALIDATOR = z.string().min(1, "Category name must be at least 1 character long").max(100, "Category name must be at most 100 characters long").regex(/^[a-zA-Z0-9-]+$/, "Category name must only contain letters, numbers, and hypens.");
