import { handle } from '@/lib/main/shared'
import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import type { Transaction } from '../schemas/finance-schema'

// دیتابیس در مسیر امن سیستم‌عامل ذخیره می‌شود
const dbPath = path.join(app.getPath('userData'), 'finance.db')
const db = new Database(dbPath)

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
    return db.prepare('SELECT * FROM transactions ORDER BY id DESC').all() as Transaction[]
  })

  handle('finance-add-transaction', (tx) => {
    db.prepare('INSERT INTO transactions (type, amount, person_name, note, date) VALUES (@type, @amount, @person_name, @note, @date)').run(tx)
  })

  handle('finance-update-transaction', (tx) => {
    db.prepare('UPDATE transactions SET type=@type, amount=@amount, person_name=@person_name, note=@note, date=@date WHERE id=@id').run(tx)
  })

  handle('finance-delete-transaction', (id) => {
    db.prepare('DELETE FROM transactions WHERE id = ?').run(id)
  })

  handle('finance-get-persons', () => {
    // گرفتن لیست اشخاص و محاسبه اینکه چقدر طلبکاریم یا بدهکار
    const rows = db.prepare(`
      SELECT 
        person_name,
        SUM(CASE WHEN type = 'lend' THEN amount ELSE 0 END) as total_lent,
        SUM(CASE WHEN type = 'borrow' THEN amount ELSE 0 END) as total_borrowed
      FROM transactions
      WHERE person_name IS NOT NULL AND person_name != ''
      GROUP BY person_name
    `).all() as any[]
    
    return rows.map(r => ({
      person_name: r.person_name,
      total_lent: r.total_lent,
      total_borrowed: r.total_borrowed,
      balance: r.total_lent - r.total_borrowed // مثبت = طلبکار، منفی = بدهکار
    }))
  })
}