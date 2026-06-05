import { useState, useEffect, useCallback } from 'react'
import { useConveyor } from '@/app/hooks/use-conveyor'
import type { Transaction, PersonBalance, Account } from '@/lib/conveyor/schemas/finance-schema'

export function useFinance() {
  const api = useConveyor('finance')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [persons, setPersons] = useState<PersonBalance[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [summary, setSummary] = useState({ lent: 0, borrowed: 0, expense: 0, total_balance: 0 })

  const loadData = useCallback(async () => {
    try {
      const [txData, pData, accData] = await Promise.all([
        api.getTransactions(), api.getPersons(), api.getAccounts()
      ])
      
      setTransactions(txData)
      setPersons(pData)
      setAccounts(accData)
      
      let l = 0, b = 0, e = 0, tBal = 0
      txData.forEach(t => {
        if (t.type === 'lend') l += t.amount
        if (t.type === 'borrow') b += t.amount
        if (t.type === 'expense') e += t.amount
      })
      accData.forEach(a => { tBal += (a.balance || 0) })
      setSummary({ lent: l, borrowed: b, expense: e, total_balance: tBal })
    } catch (error) { console.error(error) }
  }, [api])

  useEffect(() => { loadData() }, [loadData])

  return {
    transactions, persons, accounts, summary,
    addTx: async (tx: Omit<Transaction, 'id'>) => { await api.addTransaction(tx); loadData() },
    updateTx: async (tx: Transaction) => { await api.updateTransaction(tx); loadData() },
    deleteTx: async (id: number) => { await api.deleteTransaction(id); loadData() },
    addAccount: async (acc: Omit<Account, 'id' | 'balance'>) => { await api.addAccount(acc); loadData() },
    refresh: loadData
  }
}