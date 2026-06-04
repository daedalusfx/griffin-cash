// lib/conveyor/handlers/finance-handler.ts
import { handle } from '@/lib/main/shared'
import Database from 'better-sqlite3'
import type { Transaction } from '../schemas/finance-schema'

// ایجاد دیتابیس (در محیط واقعی بهتر است مسیر را با app.getPath('userData') بسازی)
const db = new Database('finance.db')

// ساخت جداول
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    person_name TEXT,
    note TEXT,
    date TEXT NOT NULL
  );
`)

export const registerFinanceHandlers = () => {
  handle('finance-get-transactions', () => {
    const stmt = db.prepare('SELECT * FROM transactions ORDER BY id DESC')
    return stmt.all() as Transaction[]
  })

  handle('finance-add-transaction', (tx) => {
    const stmt = db.prepare(`
      INSERT INTO transactions (type, amount, person_name, note, date)
      VALUES (@type, @amount, @person_name, @note, @date)
    `)
    stmt.run(tx)
  })
}