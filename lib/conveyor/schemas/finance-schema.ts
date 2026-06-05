import { z } from 'zod'

// ساختار حساب‌های مالی
export const AccountSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  type: z.enum(['fiat', 'crypto', 'cash']),
  balance: z.number().optional() // فیلد محاسباتی
})

// ساختار تراکنش‌ها (آپدیت شده با حساب بانکی و سررسید)
export const TransactionSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['lend', 'borrow', 'expense', 'income', 'transfer']),
  amount: z.number(),
  account_id: z.number(), // حسابی که پول ازش کم یا بهش اضافه میشه
  to_account_id: z.number().optional().nullable(), // برای انتقال بین حساب‌ها
  person_name: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  date: z.string(),
  due_date: z.string().optional().nullable(), // تاریخ سررسید تقویمی
  
  // فیلدهای کمکی برای نمایش در UI
  account_name: z.string().optional().nullable(),
  to_account_name: z.string().optional().nullable()
})

export const PersonBalanceSchema = z.object({
  person_name: z.string(),
  total_lent: z.number(),
  total_borrowed: z.number(),
  balance: z.number()
})

export type Account = z.infer<typeof AccountSchema>
export type Transaction = z.infer<typeof TransactionSchema>
export type PersonBalance = z.infer<typeof PersonBalanceSchema>

export const financeIpcSchema = {
  'finance-get-transactions': { args: z.tuple([]), return: z.array(TransactionSchema) },
  'finance-add-transaction': { args: z.tuple([TransactionSchema.omit({ id: true })]), return: z.void() },
  'finance-update-transaction': { args: z.tuple([TransactionSchema]), return: z.void() },
  'finance-delete-transaction': { args: z.tuple([z.number()]), return: z.void() },
  'finance-get-persons': { args: z.tuple([]), return: z.array(PersonBalanceSchema) },
  
  // روت‌های مربوط به حساب‌های مالی
  'finance-get-accounts': { args: z.tuple([]), return: z.array(AccountSchema) },
  'finance-add-account': { args: z.tuple([AccountSchema.omit({ id: true, balance: true })]), return: z.void() },

  // اضافه کردن مسیرهای ایمپورت و اکسپورت
'finance-export-excel': { 
  args: z.tuple([]), 
  return: z.object({ success: z.boolean(), message: z.string() }) 
},
'finance-import-excel': { 
  args: z.tuple([]), 
  return: z.object({ success: z.boolean(), message: z.string(), count: z.number().optional() }) 
},
}