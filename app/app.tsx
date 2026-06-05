import React, { useState } from 'react'
import { useFinance } from './hooks/useFinance'
import type { Transaction, Account } from '@/lib/conveyor/schemas/finance-schema'
import {
  Wallet, SquaresFour, Users, ArrowUpRight, ArrowDownLeft, 
  ShoppingCart, PlusCircle, Trash, PencilSimple, UserCircle,
  Bank, CurrencyBtc, Money, ArrowsLeftRight, CalendarBlank,
  ArrowsLeftRightIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ShoppingCartIcon,
  WalletIcon,
  CurrencyBtcIcon,
  MoneyIcon,
  BankIcon,
  SquaresFourIcon,
  UsersIcon,
  UserCircleIcon
} from '@phosphor-icons/react'
import './styles/app.css'

export default function App() {
  const { transactions, persons, accounts, summary, addTx, updateTx, deleteTx, addAccount } = useFinance()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'persons' | 'accounts'>('dashboard')
  
  const [editId, setEditId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    type: 'expense' as Transaction['type'],
    amount: '', account_id: '', to_account_id: '',
    person_name: '', note: '', due_date: ''
  })

  // فرم حساب جدید
  const [accForm, setAccForm] = useState({ name: '', type: 'fiat' as Account['type'] })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.account_id) return

    const txData = {
      type: formData.type,
      amount: Number(formData.amount),
      account_id: Number(formData.account_id),
      to_account_id: formData.type === 'transfer' ? Number(formData.to_account_id) : null,
      person_name: formData.person_name,
      note: formData.note,
      due_date: formData.due_date || null,
      date: editId ? transactions.find(t => t.id === editId)?.date || new Date().toLocaleDateString('fa-IR') : new Date().toLocaleDateString('fa-IR')
    }

    if (editId) { await updateTx({ id: editId, ...txData }); setEditId(null) } 
    else { await addTx(txData) }
    
    setFormData({ type: 'expense', amount: '', account_id: formData.account_id, to_account_id: '', person_name: '', note: '', due_date: '' })
  }

  const handleEdit = (tx: Transaction) => {
    setEditId(tx.id!)
    setFormData({ 
      type: tx.type, amount: String(tx.amount), account_id: String(tx.account_id), 
      to_account_id: String(tx.to_account_id || ''), person_name: tx.person_name || '', 
      note: tx.note || '', due_date: tx.due_date || ''
    })
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!accForm.name) return
    await addAccount({ name: accForm.name, type: accForm.type })
    setAccForm({ name: '', type: 'fiat' })
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'lend': return { icon: <ArrowUpRightIcon />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', label: 'قرض دادم' }
      case 'borrow': return { icon: <ArrowDownLeftIcon />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', label: 'قرض گرفتم' }
      case 'expense': return { icon: <ShoppingCartIcon />, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', label: 'خرج' }
      case 'transfer': return { icon: <ArrowsLeftRightIcon />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', label: 'انتقال' }
      default: return { icon: <WalletIcon />, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', label: 'درآمد' }
    }
  }

  const getAccountIcon = (type: string) => {
    if (type === 'crypto') return <CurrencyBtcIcon />
    if (type === 'cash') return <MoneyIcon />
    return <BankIcon />
  }

  return (
    <div className="bg-background text-foreground h-full flex overflow-hidden font-sans selection:bg-primary/20" dir="rtl">
      
      {/* Sidebar */}
      <aside className="w-64 bg-card border-l border-border hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold flex items-center gap-2"><Wallet className="text-blue-500 text-2xl" weight="duotone" /> حسابدار من</h1>
        </div>
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {[
              { id: 'dashboard', icon: <SquaresFourIcon />, label: 'داشبورد' },
              { id: 'accounts', icon: <BankIcon />, label: 'حساب‌های مالی' },
              { id: 'persons', icon: <UsersIcon />, label: 'مخاطبین' }
            ].map(tab => (
              <li key={tab.id}>
                <button onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'hover:bg-accent text-muted-foreground'}`}>
                  <span className="text-xl">{tab.icon}</span> {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-8 relative">
        
        {/* --- VIEW: ACCOUNTS --- */}
        {activeTab === 'accounts' && (
          <div className="animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Bank className="text-blue-500"/> مدیریت حساب‌ها</h2>
            
            <div className="bg-card border border-border p-5 rounded-xl mb-8">
              <h3 className="font-semibold mb-4">تعریف حساب جدید</h3>
              <form onSubmit={handleAddAccount} className="flex gap-4">
                <input type="text" required placeholder="نام حساب (مثلاً بانک ملت، ولت تراست)" value={accForm.name} onChange={e => setAccForm({...accForm, name: e.target.value})} className="flex-1 bg-background border border-border rounded-lg p-2.5" />
                <select value={accForm.type} onChange={e => setAccForm({...accForm, type: e.target.value as any})} className="bg-background border border-border rounded-lg p-2.5 w-48">
                  <option value="fiat">بانکی / فیات</option>
                  <option value="crypto">رمزارز / Crypto</option>
                  <option value="cash">پول نقد</option>
                </select>
                <button type="submit" className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700">ثبت حساب</button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {accounts.map(acc => (
                <div key={acc.id} className="bg-card border border-border p-5 rounded-xl flex flex-col">
                  <div className="flex justify-between items-center mb-4 text-muted-foreground">
                    <span className="text-2xl">{getAccountIcon(acc.type)}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">{acc.type.toUpperCase()}</span>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{acc.name}</h4>
                  <div className="text-xl font-bold text-blue-500 mt-auto" dir="ltr">{acc.balance?.toLocaleString('fa-IR')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-600 text-white rounded-xl p-5 shadow-lg flex flex-col justify-between">
                <p className="text-blue-100 mb-1">موجودی کل حساب‌ها</p>
                <h3 className="text-2xl font-bold">{summary.total_balance.toLocaleString('fa-IR')}</h3>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <p className="text-sm text-muted-foreground mb-1">طلب‌ها</p>
                <h3 className="text-xl font-bold text-orange-500">{summary.lent.toLocaleString('fa-IR')}</h3>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <p className="text-sm text-muted-foreground mb-1">بدهی‌ها</p>
                <h3 className="text-xl font-bold text-blue-500">{summary.borrowed.toLocaleString('fa-IR')}</h3>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border">
                <p className="text-sm text-muted-foreground mb-1">خرج‌ها</p>
                <h3 className="text-xl font-bold text-red-500">{summary.expense.toLocaleString('fa-IR')}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-0">
                  <div className={`p-4 border-b border-border text-white ${editId ? 'bg-orange-500' : 'bg-blue-600'}`}>
                    <h3 className="font-semibold flex items-center gap-2"><PlusCircle className="text-xl" /> {editId ? 'ویرایش' : 'ثبت تراکنش'}</h3>
                  </div>
                  
                  {accounts.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">ابتدا از منوی حساب‌ها، یک حساب مالی تعریف کنید.</div>
                  ) : (
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-background border border-border rounded-lg p-2.5">
                        <option value="expense">خرج کردم</option>
                        <option value="income">درآمد</option>
                        <option value="lend">قرض دادم</option>
                        <option value="borrow">قرض گرفتم</option>
                        <option value="transfer">انتقال بین حساب‌ها</option>
                      </select>

                      <div className="flex gap-2">
                        <select required value={formData.account_id} onChange={e => setFormData({...formData, account_id: e.target.value})} className="flex-1 bg-background border border-border rounded-lg p-2.5 text-sm">
                          <option value="" disabled>{formData.type === 'transfer' ? 'از حساب (مبدا)' : 'انتخاب حساب'}</option>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        
                        {formData.type === 'transfer' && (
                          <select required value={formData.to_account_id} onChange={e => setFormData({...formData, to_account_id: e.target.value})} className="flex-1 bg-background border border-border rounded-lg p-2.5 text-sm">
                            <option value="" disabled>به حساب (مقصد)</option>
                            {accounts.filter((a:any) => a.id.toString() !== formData.account_id).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                        )}
                      </div>

                      <input type="number" required placeholder="مبلغ (تومان/واحد)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-background border border-border rounded-lg p-2.5" />
                      
                      {formData.type !== 'transfer' && (
                        <input type="text" placeholder="نام شخص یا موضوع" value={formData.person_name} onChange={e => setFormData({...formData, person_name: e.target.value})} className="w-full bg-background border border-border rounded-lg p-2.5" />
                      )}

                      {(formData.type === 'lend' || formData.type === 'borrow') && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">تاریخ سررسید (اختیاری)</label>
                          <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full bg-background border border-border rounded-lg p-2.5 font-sans" />
                        </div>
                      )}

                      <textarea rows={2} placeholder="یادداشت" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-background border border-border rounded-lg p-2.5 resize-none" />
                      
                      <div className="flex gap-2">
                        <button type="submit" className={`flex-1 text-white py-3 rounded-lg transition-colors ${editId ? 'bg-orange-500' : 'bg-blue-600'}`}>{editId ? 'بروزرسانی' : 'ذخیره'}</button>
                        {editId && <button type="button" onClick={() => setEditId(null)} className="bg-muted text-muted-foreground px-4 rounded-lg">لغو</button>}
                      </div>
                    </form>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-3 pb-10">
                {transactions.map(t => {
                  const conf = getTypeConfig(t.type)
                  return (
                    <div key={t.id} className="bg-card border border-border p-4 rounded-xl flex items-center justify-between group relative overflow-hidden">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${conf.bg} ${conf.color}`}>{conf.icon}</div>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {t.type === 'transfer' ? <span className="text-purple-500">انتقال وجه</span> : (t.person_name || 'بدون نام')}
                            {t.due_date && <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 px-2 py-0.5 rounded flex items-center gap-1"><CalendarBlank/> سررسید: {t.due_date}</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {conf.label} • {t.type === 'transfer' ? `${t.account_name} ➔ ${t.to_account_name}` : t.account_name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 z-10 bg-card pl-2">
                        <div className={`font-bold text-lg ${conf.color}`} dir="ltr">{t.amount.toLocaleString('fa-IR')}</div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(t)} className="p-2 bg-blue-50 text-blue-500 rounded"><PencilSimple /></button>
                          <button onClick={() => t.id && deleteTx(t.id)} className="p-2 bg-red-50 text-red-500 rounded"><Trash /></button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: PERSONS (اشخاص) --- */}
        {activeTab === 'persons' && (
          <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="text-blue-500"/> وضعیت حساب اشخاص</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {persons.length === 0 && <p className="text-muted-foreground">هیچ شخص ثبت‌شده‌ای یافت نشد.</p>}
              
              {persons.map((p, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-3 border-b border-border pb-3">
                    <UserCircleIcon className="text-4xl text-muted-foreground" weight="light" />
                    <h3 className="text-xl font-bold">{p.person_name}</h3>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">بهش قرض دادم:</span>
                    <span className="text-orange-500">{p.total_lent.toLocaleString()} تومان</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ازش قرض گرفتم:</span>
                    <span className="text-blue-500">{p.total_borrowed.toLocaleString()} تومان</span>
                  </div>
                  
                  <div className={`mt-2 p-3 rounded-lg flex justify-between font-bold ${p.balance > 0 ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30' : p.balance < 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30' : 'bg-muted text-muted-foreground'}`}>
                    <span>وضعیت نهایی:</span>
                    <span dir="ltr">
                      {p.balance > 0 ? `+ ${p.balance.toLocaleString()} (طلبکارم)` : 
                       p.balance < 0 ? `- ${Math.abs(p.balance).toLocaleString()} (بدهکارم)` : 'تصفیه شده'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}