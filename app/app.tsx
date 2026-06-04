// app.tsx
import { useEffect, useState } from 'react'
import { useConveyor } from '@/app/hooks/use-conveyor'
import type { Transaction } from '@/lib/conveyor/schemas/finance-schema'
import {
  Wallet, SquaresFour, ListDashes, Users, User,
  ArrowUpRight, ArrowDownLeft, ShoppingCart,
  PlusCircle, ClockCounterClockwise, CalendarBlank, Note
} from '@phosphor-icons/react'
import './styles/app.css'

export default function App() {
  const financeApi = useConveyor('finance')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  // استیت‌های فرم
  const [formData, setFormData] = useState({
    type: 'expense' as Transaction['type'],
    amount: '',
    person_name: '',
    note: ''
  })

  // استیت برای خلاصه‌وضعیت (بالای صفحه)
  const [summary, setSummary] = useState({ lent: 0, borrowed: 0, expense: 0 })

  // ۱. تابع دریافت اطلاعات از دیتابیس
  const fetchTransactions = async () => {
    try {
      const data = await financeApi.getTransactions()
      setTransactions(data)
      calculateSummary(data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  // ۲. محاسبه جمع کل برای کارت‌های بالا
  const calculateSummary = (data: Transaction[]) => {
    let lent = 0, borrowed = 0, expense = 0
    data.forEach(t => {
      if (t.type === 'lend') lent += t.amount
      if (t.type === 'borrow') borrowed += t.amount
      if (t.type === 'expense') expense += t.amount
    })
    setSummary({ lent, borrowed, expense })
  }

  // گرفتن دیتا موقع لود شدن برنامه
  useEffect(() => {
    fetchTransactions()
  }, [])

  // ۳. ثبت تراکنش جدید
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || isNaN(Number(formData.amount))) return

    try {
      await financeApi.addTransaction({
        type: formData.type,
        amount: Number(formData.amount),
        person_name: formData.person_name,
        note: formData.note,
        date: new Date().toLocaleDateString('fa-IR')
      })
      
      // پاک کردن فرم
      setFormData({ type: 'expense', amount: '', person_name: '', note: '' })
      
      // رفرش کردن لیست
      fetchTransactions()
    } catch (error) {
      console.error('Failed to save transaction:', error)
    }
  }

  // ۴. تنظیمات ظاهری (رنگ و آیکون) بر اساس نوع تراکنش
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'lend': return { icon: <ArrowUpRight weight="bold" />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300', label: 'قرض دادم' }
      case 'borrow': return { icon: <ArrowDownLeft weight="bold" />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', label: 'قرض گرفتم' }
      case 'expense': return { icon: <ShoppingCart weight="bold" />, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', label: 'خرج' }
      default: return { icon: <Wallet weight="bold" />, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', label: 'درآمد' }
    }
  }

  return (
    <div className="bg-background text-foreground h-full flex overflow-hidden font-sans selection:bg-primary/20" dir="rtl">
      
      {/* سایدبار */}
      <aside className="w-64 bg-card border-l border-border hidden md:flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Wallet className="text-blue-500 text-2xl" weight="duotone" />
            حسابدار من
          </h1>
        </div>
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center gap-3 bg-blue-600/10 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-lg transition-colors font-medium">
                <SquaresFour className="text-xl" /> داشبورد
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 hover:bg-accent hover:text-accent-foreground px-4 py-3 rounded-lg transition-colors text-muted-foreground">
                <ListDashes className="text-xl" /> همه تراکنش‌ها
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 hover:bg-accent hover:text-accent-foreground px-4 py-3 rounded-lg transition-colors text-muted-foreground">
                <Users className="text-xl" /> اشخاص
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* محتوای اصلی */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-card border-b border-border p-4 flex justify-between items-center z-10 shadow-sm">
          <h2 className="text-lg font-semibold">نمای کلی</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">امروز: {new Date().toLocaleDateString('fa-IR')}</span>
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-muted-foreground">
              <User className="text-xl" weight="fill" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          
          {/* کارت‌های خلاصه وضعیت */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center justify-between transition-all hover:shadow-md">
              <div>
                <p className="text-sm text-muted-foreground mb-1">کل طلب‌های من</p>
                <h3 className="text-2xl font-bold text-orange-500">{summary.lent.toLocaleString('fa-IR')} تومان</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-500 text-2xl">
                <ArrowUpRight weight="bold" />
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center justify-between transition-all hover:shadow-md">
              <div>
                <p className="text-sm text-muted-foreground mb-1">کل بدهی‌های من</p>
                <h3 className="text-2xl font-bold text-blue-500">{summary.borrowed.toLocaleString('fa-IR')} تومان</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-500 text-2xl">
                <ArrowDownLeft weight="bold" />
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-sm border border-border flex items-center justify-between transition-all hover:shadow-md">
              <div>
                <p className="text-sm text-muted-foreground mb-1">مجموع خرج‌کردها</p>
                <h3 className="text-2xl font-bold text-red-500">{summary.expense.toLocaleString('fa-IR')} تومان</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 text-2xl">
                <ShoppingCart weight="bold" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
            
            {/* بخش فرم ثبت */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="bg-muted/30 p-4 border-b border-border">
                  <h3 className="font-semibold flex items-center gap-2">
                    <PlusCircle className="text-blue-500 text-xl" weight="fill" /> ثبت تراکنش جدید
                  </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">نوع تراکنش</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as Transaction['type']})}
                      className="w-full bg-background border border-border rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-foreground"
                    >
                      <option value="expense">خرج کردم (Expense)</option>
                      <option value="lend">به کسی قرض دادم (Lend)</option>
                      <option value="borrow">از کسی قرض گرفتم (Borrow)</option>
                      <option value="income">درآمد / دریافت (Income)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">مبلغ (تومان)</label>
                    <input 
                      type="number" required
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-foreground" placeholder="مثلا 500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">شخص / عنوان</label>
                    <input 
                      type="text" required
                      value={formData.person_name}
                      onChange={e => setFormData({...formData, person_name: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-foreground" placeholder="نام شخص یا موضوع"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">یادداشت</label>
                    <textarea 
                      rows={3}
                      value={formData.note}
                      onChange={e => setFormData({...formData, note: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-foreground resize-none" placeholder="توضیحات تکمیلی..."
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2 shadow-sm">
                    ثبت و ذخیره
                  </button>
                </form>
              </div>
            </div>

            {/* لیست تاریخچه تراکنش‌ها */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden flex flex-col h-full max-h-[600px]">
                <div className="bg-muted/30 p-4 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ClockCounterClockwise className="text-muted-foreground text-xl" weight="bold" /> تاریخچه تراکنش‌ها
                  </h3>
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-md">{transactions.length} تراکنش</span>
                </div>
                
                <div className="p-0 overflow-y-auto custom-scrollbar">
                  {transactions.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                      <Wallet className="text-6xl mb-3 opacity-20" weight="duotone" />
                      <p>هیچ تراکنشی یافت نشد. اولین تراکنش خود را ثبت کنید!</p>
                    </div>
                  ) : (
                    transactions.map((t) => {
                      const config = getTypeConfig(t.type);
                      return (
                        <div key={t.id} className="border-b border-border p-5 hover:bg-muted/20 transition-colors flex flex-col gap-3 group">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4 items-center">
                              <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center shrink-0 text-2xl ${config.color} shadow-sm`}>
                                {config.icon}
                              </div>
                              <div>
                                <h4 className="font-bold text-foreground text-lg">{t.person_name || 'بدون نام'}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${config.badge}`}>{config.label}</span>
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <CalendarBlank /> {t.date}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className={`text-left font-bold text-lg ${config.color}`} dir="ltr">
                              {t.amount.toLocaleString('fa-IR')}
                            </div>
                          </div>
                          {t.note && (
                            <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground border border-border flex gap-2 items-start mt-2">
                              <Note className="text-muted-foreground text-lg shrink-0 mt-0.5 opacity-50" />
                              <p className="leading-relaxed">{t.note}</p>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}