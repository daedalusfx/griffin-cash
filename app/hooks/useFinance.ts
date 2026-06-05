import { useState, useEffect, useCallback } from 'react'
import { useConveyor } from '@/app/hooks/use-conveyor'
import type { Transaction, PersonBalance } from '@/lib/conveyor/schemas/finance-schema'

export function useFinance() {
  const api = useConveyor('finance')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [persons, setPersons] = useState<PersonBalance[]>([])
  const [summary, setSummary] = useState({ lent: 0, borrowed: 0, expense: 0 })

  const loadData = useCallback(async () => {
    try {
      const [txData, pData] = await Promise.all([
        api.getTransactions(),
        api.getPersons()
      ])
      
      setTransactions(txData)
      setPersons(pData)
      
      let l = 0, b = 0, e = 0
      txData.forEach(t => {
        if (t.type === 'lend') l += t.amount
        if (t.type === 'borrow') b += t.amount
        if (t.type === 'expense') e += t.amount
      })
      setSummary({ lent: l, borrowed: b, expense: e })
    } catch (error) {
      console.error('Data loading error:', error)
    }
  }, [api])

  useEffect(() => { loadData() }, [loadData])

  return {
    transactions, persons, summary,
    addTx: async (tx: Omit<Transaction, 'id'>) => { await api.addTransaction(tx); loadData() },
    updateTx: async (tx: Transaction) => { await api.updateTransaction(tx); loadData() },
    deleteTx: async (id: number) => { await api.deleteTransaction(id); loadData() },
    refresh: loadData
  }
}