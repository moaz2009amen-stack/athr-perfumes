'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

interface ChartData {
  date: string
  orders: number
  revenue: number
}

export function OrdersChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    fetchChartData()
  }, [period])

  const fetchChartData = async () => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)

      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (!orders) return

      // Group by date
      const grouped: Record<string, { orders: number; revenue: number }> = {}

      // Initialize all dates
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        grouped[dateStr] = { orders: 0, revenue: 0 }
      }

      // Fill with data
      orders.forEach((order) => {
        const dateStr = order.created_at.split('T')[0]
        if (grouped[dateStr]) {
          grouped[dateStr].orders += 1
          grouped[dateStr].revenue += Number(order.total)
        }
      })

      // Convert to array and sort
      const chartData = Object.entries(grouped)
        .map(([date, values]) => ({
          date: new Date(date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
          orders: values.orders,
          revenue: values.revenue,
        }))
        .reverse()

      setData(chartData)
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>المبيعات والطلبات</CardTitle>
            <CardDescription>نظرة عامة على أداء المتجر</CardDescription>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as '7d' | '30d' | '90d')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 أيام</SelectItem>
              <SelectItem value="30d">30 يوم</SelectItem>
              <SelectItem value="90d">90 يوم</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #c9a84c',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'revenue') return formatPrice(value)
                    return value
                  }}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c9a84c"
                  fill="url(#colorRevenue)"
                  name="المبيعات"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke="#e2c97e"
                  strokeWidth={2}
                  dot={{ fill: '#e2c97e' }}
                  name="الطلبات"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
