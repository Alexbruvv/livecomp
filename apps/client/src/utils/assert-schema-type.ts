import { z } from "zod";

// Helper function for development type-checking only
export default function assertSchemaType<T>(schema: z.ZodType<T>): z.ZodType<T> {
    return schema;
}

