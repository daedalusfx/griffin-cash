import { ConveyorApi } from '@/lib/preload/shared'
import type { Transaction, Account } from '../schemas/finance-schema'

export class FinanceApi extends ConveyorApi {
  getTransactions = () => this.invoke('finance-get-transactions')
  addTransaction = (tx: Omit<Transaction, 'id'>) => this.invoke('finance-add-transaction', tx)
  updateTransaction = (tx: Transaction) => this.invoke('finance-update-transaction', tx)
  deleteTransaction = (id: number) => this.invoke('finance-delete-transaction', id)
  getPersons = () => this.invoke('finance-get-persons')
  
  getAccounts = () => this.invoke('finance-get-accounts')
  addAccount = (acc: Omit<Account, 'id' | 'balance'>) => this.invoke('finance-add-account', acc)

  exportExcel = () => this.invoke('finance-export-excel')
  importExcel = () => this.invoke('finance-import-excel')
}