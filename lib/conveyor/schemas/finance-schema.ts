// lib/conveyor/schemas/finance-schema.ts
import { z } from 'zod'

// تعریف ساختار داده یک تراکنش برای استفاده مجدد
export const TransactionSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['lend', 'borrow', 'expense', 'income']),
  amount: z.number(),
  person_name: z.string().optional(),
  note: z.string().optional(),
  date: z.string()
})

export type Transaction = z.infer<typeof TransactionSchema>

export const financeIpcSchema = {
  'finance-get-transactions': {
    args: z.tuple([]),
    return: z.array(TransactionSchema),
  },
  'finance-add-transaction': {
    args: z.tuple([TransactionSchema.omit({ id: true })]), // موقع ثبت ID نیاز نیست
    return: z.void(),
  },
}