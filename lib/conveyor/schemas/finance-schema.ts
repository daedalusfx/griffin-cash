import { z } from 'zod'

export const TransactionSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['lend', 'borrow', 'expense', 'income']),
  amount: z.number(),
  person_name: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  date: z.string()
})

export const PersonBalanceSchema = z.object({
  person_name: z.string(),
  total_lent: z.number(),
  total_borrowed: z.number(),
  balance: z.number()
})

export type Transaction = z.infer<typeof TransactionSchema>
export type PersonBalance = z.infer<typeof PersonBalanceSchema>

export const financeIpcSchema = {
  'finance-get-transactions': { args: z.tuple([]), return: z.array(TransactionSchema) },
  'finance-add-transaction': { args: z.tuple([TransactionSchema.omit({ id: true })]), return: z.void() },
  'finance-update-transaction': { args: z.tuple([TransactionSchema]), return: z.void() },
  'finance-delete-transaction': { args: z.tuple([z.number()]), return: z.void() },
  'finance-get-persons': { args: z.tuple([]), return: z.array(PersonBalanceSchema) },
}