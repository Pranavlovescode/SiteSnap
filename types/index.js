import { z } from "zod";

export const SignUpSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6)
});

export const SignInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});