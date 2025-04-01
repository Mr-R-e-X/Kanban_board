import { z } from "zod";

export const signInValidation = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Enter a valid email address (e.g., user@example.com)" }),
  password: z
    .string()
    .trim()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(20, { message: "Password must be at most 20 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[@$!%*?&]/, {
      message: "Password must contain at least one special character",
    }),
});

export const signUpValidation = signInValidation.extend({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters long" })
    .max(20, { message: "Name must be at most 20 characters long" })
    .regex(/[A-Za-z]/, { message: "Name must contain only letters" }),
});

export const verifyCodeValidation = z.object({
  code: z
    .string()
    .trim()
    .length(6, { message: "Verification code must be exactly 6 digits" }),
});

export const createBoardValidation = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(20, { message: "Title must be at most 30 characters long" }),
  description: z
    .string()
    .trim()
    .min(3, { message: "Description must be at least 3 characters long" })
    .max(250, {
      message: "Description must be at most 250 characters long",
    }),
  overall_priority: z.enum(["low", "medium", "high", "urgent"]),
});

export const updateBoardValidation = createBoardValidation.extend({
  _id: z.string().trim().optional(),
});

export const createTaskValidation = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, { message: "Title must be at least 3 characters long" })
      .max(20, { message: "Title must be at most 20 characters long" }),

    description: z
      .string()
      .trim()
      .min(3, { message: "Description must be at least 3 characters long" })
      .max(250, { message: "Description must be at most 250 characters long" }),

    priority: z.enum(["low", "medium", "high", "urgent"]),
    status: z.enum(["TO DO", "IN PROGRESS", "DONE", "SAVED FOR LATER"]),

    board_id: z.string().trim().min(1, { message: "Board ID is required" }),
    board_name: z.string().trim().optional(),

    start_date: z.string().optional().nullable(),
    due_date: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.due_date) {
        const start = new Date(data.start_date);
        const due = new Date(data.due_date);
        return due >= start;
      }
      return true;
    },
    { message: "Due date must be after start date", path: ["due_date"] }
  );

export const updateTaskValidation = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, { message: "Title must be at least 3 characters long" })
      .max(20, { message: "Title must be at most 20 characters long" }),

    description: z
      .string()
      .trim()
      .min(3, { message: "Description must be at least 3 characters long" })
      .max(250, { message: "Description must be at most 250 characters long" }),

    priority: z.enum(["low", "medium", "high", "urgent"]),
    status: z.enum(["TO DO", "IN PROGRESS", "DONE", "SAVED FOR LATER"]),

    board_id: z.string().trim().optional(),
    task_id: z.string().trim().min(1, { message: "Task ID is required" }),
    board_name: z.string().trim().optional(),

    start_date: z.string().optional().nullable(),
    due_date: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.due_date) {
        const start = new Date(data.start_date);
        const due = new Date(data.due_date);
        return due >= start;
      }
      return true;
    },
    { message: "Due date must be after start date", path: ["due_date"] }
  );
