import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { OrdersChart } from '@/components/admin/OrdersChart'
import { RecentOrders } from '@/components/admin/RecentOrders'
import { TopProducts } from '@/components/admin/TopProducts'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createAdminSupabaseClient()

  // Fetch stats
  const [
    { count: totalOrders },
    { count: totalCustomers },
    { count: totalProducts },
    { data: revenueData },
    { data: recentOrders },
    { data: ordersByStatus },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total, created_at').eq('payment_status', 'paid'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('status'),
  ])

  // Calculate total revenue
  const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total), 0) || 0

  // Calculate this month's revenue
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)
  
  const thisMonthRevenue = revenueData
    ?.filter(order => new Date(order.created_at) >= thisMonth)
    .reduce((sum, order) => sum + Number(order.total), 0) || 0

  // Count orders by status
  const statusCounts = ordersByStatus?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const stats = [
    {
      title: 'إجمالي الطلبات',
      value: totalOrders?.toLocaleString('ar-EG') || '0',
      icon: ShoppingBag,
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'العملاء',
      value: totalCustomers?.toLocaleString('ar-EG') || '0',
      icon: Users,
      change: '+8%',
      trend: 'up',
    },
    {
      title: 'المنتجات',
      value: totalProducts?.toLocaleString('ar-EG') || '0',
      icon: Package,
      change: '0%',
      trend: 'neutral',
    },
    {
      title: 'إجمالي المبيعات',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      change: '+15%',
      trend: 'up',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground mt-1">
          مرحباً بعودتك! هذه نظرة عامة على متجرك.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-gold/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : stat.trend === 'down' ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : null}
                <span className={`text-xs ${
                  stat.trend === 'up' ? 'text-green-500' : 
                  stat.trend === 'down' ? 'text-red-500' : 
                  'text-muted-foreground'
                }`}>
                  {stat.change} من الشهر الماضي
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders by Status */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries({
          new: 'جديد',
          processing: 'قيد التجهيز',
          shipped: 'تم الشحن',
          delivered: 'تم التسليم',
          cancelled: 'ملغي',
        }).map(([status, label]) => (
          <Card key={status} className="border-gold/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">
                  {statusCounts[status] || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrdersChart />
        </div>
        <div>
          <TopProducts />
        </div>
      </div>

      {/* Recent Orders */}
      <RecentOrders orders={recentOrders || []} />
    </div>
  )
}
