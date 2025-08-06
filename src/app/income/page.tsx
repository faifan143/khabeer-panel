"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminOrders } from '@/lib/api/hooks/useAdmin'
import { formatCurrency } from '@/lib/utils'
import {
  DollarSign,
  Eye,
  Search,
  TrendingUp,
  Users,
  Gift
} from 'lucide-react'
import { useMemo, useState } from 'react'

export default function IncomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Fetch all orders data
  const { data: ordersResponse, isLoading } = useAdminOrders(1, 1000)
  const orders = ordersResponse?.data || []

  // Calculate financial summary from orders data
  const financialSummary = useMemo(() => {
    if (!orders.length) {
      return {
        totalRevenue: 0,
        totalCommission: 0,
        totalDiscounts: 0,
        netIncome: 0,
        totalTransactions: 0
      }
    }

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const totalCommission = orders.reduce((sum, order) => sum + (order.commissionAmount || 0), 0)
    const totalDiscounts = orders.reduce((sum, order) => {
      // Calculate discounts from offers if available
      const originalPrice = order.service?.commission || order.totalAmount || 0
      const actualPrice = order.totalAmount || 0
      return sum + Math.max(0, originalPrice - actualPrice)
    }, 0)
    const netIncome = totalRevenue - totalCommission

    return {
      totalRevenue,
      totalCommission,
      totalDiscounts,
      netIncome,
      totalTransactions: orders.length
    }
  }, [orders])

  // Filter orders based on search term
  const filteredOrders = useMemo(() => {
    return orders.filter((order: any) =>
      order.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service?.category?.titleEn?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [orders, searchTerm])

  // Sort data
  const sortedOrders = useMemo(() => {
    if (!sortField) return filteredOrders

    return [...filteredOrders].sort((a: any, b: any) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle nested objects
      if (sortField.includes('.')) {
        const [obj, prop] = sortField.split('.')
        aValue = a[obj]?.[prop]
        bValue = b[obj]?.[prop]
      }

      // Handle date fields
      if (sortField.includes('Date') || sortField.includes('date')) {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
      }

      // Handle numeric fields
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Handle string fields
      aValue = String(aValue || '').toLowerCase()
      bValue = String(bValue || '').toLowerCase()

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
  }, [filteredOrders, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, label: 'Completed' },
      pending: { variant: 'secondary' as const, label: 'Pending' },
      in_progress: { variant: 'outline' as const, label: 'In Progress' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
      accepted: { variant: 'outline' as const, label: 'Accepted' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status }
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <div className="text-sm text-muted-foreground">Loading income data...</div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">{financialSummary.totalTransactions} transactions</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Net Income
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(financialSummary.netIncome)}</div>
                <p className="text-xs text-muted-foreground">After commissions</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4 text-orange-600" />
                  Khabeer Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(financialSummary.totalCommission)}</div>
                <p className="text-xs text-muted-foreground">Platform earnings</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Gift className="h-4 w-4 text-purple-600" />
                  Total Discounts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(financialSummary.totalDiscounts)}</div>
                <p className="text-xs text-muted-foreground">Offer savings</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-indigo-600" />
                  Avg. Order Value
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-indigo-600">
                  {financialSummary.totalTransactions > 0
                    ? formatCurrency(financialSummary.totalRevenue / financialSummary.totalTransactions)
                    : formatCurrency(0)
                  }
                </div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>
          </div>

          {/* Income Table */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Income Details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete breakdown of all orders and financial transactions
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID, customer, provider, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('bookingId')}
                      >
                        Order ID {sortField === 'bookingId' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('provider.name')}
                      >
                        Provider {sortField === 'provider.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('user.name')}
                      >
                        Customer {sortField === 'user.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('orderDate')}
                      >
                        Order Date {sortField === 'orderDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('service.title')}
                      >
                        Service {sortField === 'service.title' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('totalAmount')}
                      >
                        Total Price {sortField === 'totalAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('commissionAmount')}
                      >
                        Commission {sortField === 'commissionAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('providerAmount')}
                      >
                        Price After Discount {sortField === 'providerAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {searchTerm ? 'No orders found matching your search' : 'No orders available'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedOrders.map((order: any) => (
                        <TableRow key={order.id} className="hover:bg-gray-50/50">
                          <TableCell>
                            <div className="font-medium text-gray-900">#{order.id}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{order.provider?.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{order.provider?.phone || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{order.user?.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{order.user?.email || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(order.orderDate)}</div>
                            {order.scheduledDate && (
                              <div className="text-xs text-muted-foreground">
                                Scheduled: {formatDate(order.scheduledDate)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{order.service?.title || 'N/A'}</div>
                            {order.service?.category?.titleEn && (
                              <div className="text-sm text-muted-foreground">
                                {order.service.category.titleEn}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-green-600">
                              {formatCurrency(order.totalAmount || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-orange-600">
                              {formatCurrency(order.commissionAmount || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-blue-600">
                              {formatCurrency(order.providerAmount || 0)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 