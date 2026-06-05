import { ConveyorApi } from '@/lib/preload/shared'
import type { Transaction } from '../schemas/finance-schema'

export class FinanceApi extends ConveyorApi {
  getTransactions = () => this.invoke('finance-get-transactions')
  addTransaction = (tx: Omit<Transaction, 'id'>) => this.invoke('finance-add-transaction', tx)
  updateTransaction = (tx: Transaction) => this.invoke('finance-update-transaction', tx)
  deleteTransaction = (id: number) => this.invoke('finance-delete-transaction', id)
  getPersons = () => this.invoke('finance-get-persons')
}