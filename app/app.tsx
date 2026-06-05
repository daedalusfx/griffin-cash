import React, { useState } from 'react'
import { useFinance } from './hooks/useFinance'
import type { Transaction } from '@/lib/conveyor/schemas/finance-schema'
import {
  Wallet, SquaresFour, Users, ArrowUpRight, ArrowDownLeft, 
  ShoppingCart, PlusCircle, Trash, PencilSimple, UserCircle,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  ShoppingCartIcon,
  WalletIcon
} from '@phosphor-icons/react'
import './styles/app.css'

export default function App() {
  const { transactions, persons, summary, addTx, updateTx, deleteTx } = useFinance()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'persons'>('dashboard')
  
  // State برای فرم (حالت ادیت یا اضافه)
  const [editId, setEditId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    type: 'expense' as Transaction['type'],
    amount: '',
    person_name: '',
    note: ''
  })

  // سابمیت فرم (تصمیم‌گیری بین اضافه کردن یا آپدیت کردن)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount) return

    const txData = {
      ...formData,
      amount: Number(formData.amount),
      date: new Date().toLocaleDateString('fa-IR')
    }

    if (editId) {
      await updateTx({ id: editId, ...txData })
      setEditId(null) // خروج از حالت ادیت
    } else {
      await addTx(txData)
    }
    
    // ریست فرم
    setFormData({ type: 'expense', amount: '', person_name: '', note: '' })
  }

  // پر کردن فرم برای ویرایش
  const handleEdit = (tx: Transaction) => {
    setEditId(tx.id!)
    setFormData({ type: tx.type, amount: String(tx.amount), person_name: tx.person_name || '', note: tx.note || '' })
  }

  // کلاس‌های استایل تراکنش‌ها
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'lend': return { icon: <ArrowUpRightIcon />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', label: 'قرض دادم' }
      case 'borrow': return { icon: <ArrowDownLeftIcon />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', label: 'قرض گرفتم' }
      case 'expense': return { icon: <ShoppingCartIcon />, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', label: 'خرج' }
      default: return { icon: <WalletIcon />, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', label: 'درآمد' }
    }
  }

  return (
    <div className="bg-background text-foreground h-full flex overflow-hidden font-sans selection:bg-primary/20" dir="rtl">
      
      {/* Sidebar */}
      <aside className="w-64 bg-card border-l border-border hidden md:flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Wallet className="text-blue-500 text-2xl" weight="duotone" /> حسابدار من
          </h1>
        </div>
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'dashboard' ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'hover:bg-accent text-muted-foreground'}`}
              >
                <SquaresFour className="text-xl" /> داشبورد
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('persons')} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'persons' ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'hover:bg-accent text-muted-foreground'}`}
              >
                <Users className="text-xl" /> مخاطبین و اشخاص
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-8 relative">
        
        {/* --- VIEW: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            {/* کارت‌های خلاصه */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-card rounded-xl p-5 border border-border flex justify-between hover:shadow-md transition-all">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">کل طلب‌های من</p>
                  <h3 className="text-2xl font-bold text-orange-500">{summary.lent.toLocaleString('fa-IR')} تومان</h3>
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border flex justify-between hover:shadow-md transition-all">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">کل بدهی‌های من</p>
                  <h3 className="text-2xl font-bold text-blue-500">{summary.borrowed.toLocaleString('fa-IR')} تومان</h3>
                </div>
              </div>
              <div className="bg-card rounded-xl p-5 border border-border flex justify-between hover:shadow-md transition-all">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">مجموع خرج‌ها</p>
                  <h3 className="text-2xl font-bold text-red-500">{summary.expense.toLocaleString('fa-IR')} تومان</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* فرم ثبت/ویرایش */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-0">
                  <div className={`p-4 border-b border-border text-white ${editId ? 'bg-orange-500' : 'bg-blue-600'}`}>
                    <h3 className="font-semibold flex items-center gap-2">
                      <PlusCircle className="text-xl" /> {editId ? 'ویرایش تراکنش' : 'ثبت تراکنش جدید'}
                    </h3>
                  </div>
                  <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-background border border-border rounded-lg p-2.5">
                      <option value="expense">خرج کردم</option>
                      <option value="lend">به کسی قرض دادم</option>
                      <option value="borrow">از کسی قرض گرفتم</option>
                      <option value="income">درآمد</option>
                    </select>
                    <input type="number" required placeholder="مبلغ (تومان)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-background border border-border rounded-lg p-2.5" />
                    <input type="text" placeholder="نام شخص یا موضوع" value={formData.person_name} onChange={e => setFormData({...formData, person_name: e.target.value})} className="w-full bg-background border border-border rounded-lg p-2.5" />
                    <textarea rows={3} placeholder="یادداشت و توضیحات" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-background border border-border rounded-lg p-2.5 resize-none" />
                    
                    <div className="flex gap-2">
                      <button type="submit" className={`flex-1 text-white py-3 rounded-lg transition-colors ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {editId ? 'بروزرسانی' : 'ذخیره تراکنش'}
                      </button>
                      {editId && (
                        <button type="button" onClick={() => {setEditId(null); setFormData({ type: 'expense', amount: '', person_name: '', note: '' })}} className="bg-muted text-muted-foreground px-4 rounded-lg hover:bg-accent">لغو</button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* لیست تراکنش‌ها */}
              <div className="lg:col-span-2 space-y-3 pb-10">
                {transactions.map(t => {
                  const conf = getTypeConfig(t.type)
                  return (
                    <div key={t.id} className="bg-card border border-border p-4 rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${conf.bg} ${conf.color}`}>
                          {conf.icon}
                        </div>
                        <div>
                          <div className="font-bold">{t.person_name || 'بدون نام'}</div>
                          <div className="text-xs text-muted-foreground mt-1">{conf.label} • {t.date}</div>
                          {t.note && <div className="text-xs text-muted-foreground mt-1 opacity-70">{t.note}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className={`font-bold text-lg ${conf.color}`} dir="ltr">{t.amount.toLocaleString('fa-IR')}</div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(t)} className="p-2 bg-blue-50 text-blue-500 rounded hover:bg-blue-100 dark:bg-blue-900/30"><PencilSimple /></button>
                          <button onClick={() => t.id && deleteTx(t.id)} className="p-2 bg-red-50 text-red-500 rounded hover:bg-red-100 dark:bg-red-900/30"><Trash /></button>
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
                    <UserCircle className="text-4xl text-muted-foreground" weight="light" />
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