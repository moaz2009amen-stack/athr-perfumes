import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createAdminSupabaseClient()

    // Get total counts
    const [
      { count: totalOrders },
      { count: totalCustomers },
      { count: totalProducts },
      { data: revenueData },
      { data: ordersByStatus },
      { data: recentOrders },
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total, created_at').eq('payment_status', 'paid'),
      supabase.from('orders').select('status'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
    ])

    // Calculate revenue
    const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total), 0) || 0

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const revenueByMonth = revenueData
      ?.filter(order => new Date(order.created_at) >= sixMonthsAgo)
      .reduce((acc, order) => {
        const month = new Date(order.created_at).toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' })
        acc[month] = (acc[month] || 0) + Number(order.total)
        return acc
      }, {} as Record<string, number>) || {}

    // Status counts
    const statusCounts = ordersByStatus?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return NextResponse.json({
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
      totalProducts: totalProducts || 0,
      totalRevenue,
      revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
      statusCounts,
      recentOrders: recentOrders || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
