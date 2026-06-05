import { handle } from '@/lib/main/shared'
import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import type { Transaction, Account } from '../schemas/finance-schema'

const dbPath = path.join(app.getPath('userData'), 'finance_v2.db') // تغییر نام برای جلوگیری از تداخل
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    to_account_id INTEGER,
    person_name TEXT,
    note TEXT,
    date TEXT NOT NULL,
    due_date TEXT,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (to_account_id) REFERENCES accounts(id)
  );
`)

export const registerFinanceHandlers = () => {
  handle('finance-get-accounts', () => {
    // محاسبه دقیق موجودی هر حساب بر اساس تراکنش‌ها
    return db.prepare(`
      SELECT a.id, a.name, a.type,
        COALESCE(SUM(
          CASE
            WHEN t.type = 'income' AND t.account_id = a.id THEN t.amount
            WHEN t.type = 'expense' AND t.account_id = a.id THEN -t.amount
            WHEN t.type = 'lend' AND t.account_id = a.id THEN -t.amount
            WHEN t.type = 'borrow' AND t.account_id = a.id THEN t.amount
            WHEN t.type = 'transfer' AND t.account_id = a.id THEN -t.amount
            WHEN t.type = 'transfer' AND t.to_account_id = a.id THEN t.amount
            ELSE 0
          END
        ), 0) as balance
      FROM accounts a
      LEFT JOIN transactions t ON t.account_id = a.id OR t.to_account_id = a.id
      GROUP BY a.id, a.name, a.type
    `).all() as Account[]
  })

  handle('finance-add-account', (acc) => {
    db.prepare('INSERT INTO accounts (name, type) VALUES (@name, @type)').run(acc)
  })

  handle('finance-get-transactions', () => {
    return db.prepare(`
      SELECT t.*, a1.name as account_name, a2.name as to_account_name
      FROM transactions t
      LEFT JOIN accounts a1 ON t.account_id = a1.id
      LEFT JOIN accounts a2 ON t.to_account_id = a2.id
      ORDER BY t.id DESC
    `).all() as Transaction[]
  })

  handle('finance-add-transaction', (tx) => {
    db.prepare(`
      INSERT INTO transactions (type, amount, account_id, to_account_id, person_name, note, date, due_date) 
      VALUES (@type, @amount, @account_id, @to_account_id, @person_name, @note, @date, @due_date)
    `).run(tx)
  })

  handle('finance-update-transaction', (tx) => {
    db.prepare(`
      UPDATE transactions 
      SET type=@type, amount=@amount, account_id=@account_id, to_account_id=@to_account_id, person_name=@person_name, note=@note, date=@date, due_date=@due_date 
      WHERE id=@id
    `).run(tx)
  })

  handle('finance-delete-transaction', (id) => {
    db.prepare('DELETE FROM transactions WHERE id = ?').run(id)
  })

  handle('finance-get-persons', () => {
    const rows = db.prepare(`
      SELECT person_name,
        SUM(CASE WHEN type = 'lend' THEN amount ELSE 0 END) as total_lent,
        SUM(CASE WHEN type = 'borrow' THEN amount ELSE 0 END) as total_borrowed
      FROM transactions WHERE person_name IS NOT NULL AND person_name != '' GROUP BY person_name
    `).all() as any[]
    
    return rows.map(r => ({
      person_name: r.person_name, total_lent: r.total_lent, total_borrowed: r.total_borrowed,
      balance: r.total_lent - r.total_borrowed
    }))
  })
}