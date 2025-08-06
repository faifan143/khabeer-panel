"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FinanceService, type FinancialSummary, type InvoiceData, type OfferData } from '@/lib/api/services/finance.service'
import { showError } from '@/lib/utils/toast'
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Eye,
  Gift,
  Search,
  ShoppingCart,
  TrendingUp,
  Users
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export default function IncomePage() {
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [allOrders, setAllOrders] = useState<unknown[]>([])
  const [offers, setOffers] = useState<OfferData[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate] = useState('')
  const [endDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  console.log('IncomePage render - loading:', loading, 'financialSummary:', !!financialSummary)


  const loadFinancialData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Loading financial data...')

      const [summary, invoiceData, ordersData, offerData] = await Promise.all([
        FinanceService.getFinancialSummary(startDate || undefined, endDate || undefined),
        FinanceService.getRevenueReport(startDate || undefined, endDate || undefined),
        FinanceService.getAllOrdersReport(startDate || undefined, endDate || undefined),
        FinanceService.getOffers()
      ])

      console.log('Financial data loaded successfully:', { summary, invoiceData, ordersData, offerData })

      setFinancialSummary(summary)
      setInvoices(invoiceData)
      setAllOrders(ordersData)
      setOffers(offerData)
    } catch (error) {
      console.error('Error loading financial data:', error)
      showError('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    console.log('useEffect triggered - loading financial data')
    loadFinancialData()

    // Cleanup function to prevent memory leaks
    return () => {
      console.log('IncomePage cleanup - unmounting')
    }
  }, [loadFinancialData])



  const filteredInvoices = (invoices as any[]).filter(invoice =>
    invoice.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.service.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredOffers = (offers as any[]).filter(offer =>
    offer.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.service.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAllOrders = (allOrders as any[]).filter(order =>
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.service?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'OMR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortData = (data: unknown[], field: string, direction: 'asc' | 'desc') => {
    if (!field) return data

    return [...data].sort((a, b) => {
      let aValue = (a as any)[field]
      let bValue = (b as any)[field]

      // Handle nested objects
      if (field.includes('.')) {
        const [obj, prop] = field.split('.')
        aValue = (a as any)[obj]?.[prop]
        bValue = (b as any)[obj]?.[prop]
      }

      // Handle date fields
      if (field.includes('Date') || field.includes('date')) {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
      }

      // Handle numeric fields
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Handle string fields
      aValue = String(aValue || '').toLowerCase()
      bValue = String(bValue || '').toLowerCase()

      if (direction === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  if (!financialSummary) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="text-sm font-medium mb-1">No financial data available</div>
              <div className="text-xs text-muted-foreground">Try refreshing the page</div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-4">

          {/* Compact Metrics Cards */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-green-600">{formatCurrency(financialSummary.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">{financialSummary.totalTransactions} transactions</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                  Net Income
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-blue-600">{formatCurrency(financialSummary.netIncome)}</div>
                <p className="text-xs text-muted-foreground">After commissions</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3 text-orange-600" />
                  Commission
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-orange-600">{formatCurrency(financialSummary.totalCommission)}</div>
                <p className="text-xs text-muted-foreground">Provider share</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Gift className="h-3 w-3 text-purple-600" />
                  Discounts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-purple-600">{formatCurrency(financialSummary.totalDiscounts)}</div>
                <p className="text-xs text-muted-foreground">{financialSummary.activeOffers} active offers</p>
              </CardContent>
            </Card>
          </div>



          {/* Compact Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
            <TabsList className="grid w-full grid-cols-4 h-9">
              <TabsTrigger value="overview" className="flex items-center gap-1 text-xs">
                <BarChart3 className="h-3 w-3" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex items-center gap-1 text-xs">
                <CreditCard className="h-3 w-3" />
                Invoices ({invoices.length})
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-1 text-xs">
                <ShoppingCart className="h-3 w-3" />
                Orders ({allOrders.length})
              </TabsTrigger>
              <TabsTrigger value="offers" className="flex items-center gap-1 text-xs">
                <Gift className="h-3 w-3" />
                Offers ({offers.length})
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-3">
              <Card>
                <CardHeader className=" flex items-center justify-between pb-3">
                  <CardTitle className="text-sm">Recent Financial Activity</CardTitle>
                  <div className="relative max-w-xs">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('type')}
                          >
                            Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('id')}
                          >
                            ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('user.name')}
                          >
                            Customer {sortField === 'user.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('provider.name')}
                          >
                            Provider {sortField === 'provider.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('service.title')}
                          >
                            Service {sortField === 'service.title' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('status')}
                          >
                            Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('amount')}
                          >
                            Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('date')}
                          >
                            Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead className="text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Invoices */}
                        {sortData(filteredInvoices, sortField, sortDirection).map((invoice: any) => (
                          <TableRow key={`invoice-${invoice.invoiceId}`} className="hover:bg-green-50">
                            <TableCell>
                              <Badge variant="default" className="bg-green-600 text-xs">Invoice</Badge>
                            </TableCell>
                            <TableCell className="font-medium text-xs">#{invoice.invoiceId}</TableCell>
                            <TableCell>
                              <div className="font-medium text-xs">{invoice.user.name}</div>
                              <div className="text-xs text-muted-foreground">{invoice.user.email}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-xs">{invoice.provider.name}</div>
                              <div className="text-xs text-muted-foreground">{invoice.provider.phone}</div>
                            </TableCell>
                            <TableCell className="text-xs">{invoice.service.title}</TableCell>
                            <TableCell>
                              <Badge variant="default" className="text-xs">Paid</Badge>
                            </TableCell>
                            <TableCell className="font-bold text-green-600 text-xs">
                              {formatCurrency(invoice.netAmount - invoice.commission)}
                            </TableCell>
                            <TableCell className="text-xs">{formatDate(invoice.paymentDate)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Orders */}
                        {sortData(filteredAllOrders, sortField, sortDirection).map((order: any) => (
                          <TableRow key={`order-${order.orderId}`} className="hover:bg-blue-50">
                            <TableCell>
                              <Badge variant="outline" className="border-blue-600 text-blue-600 text-xs">Order</Badge>
                            </TableCell>
                            <TableCell className="font-medium text-xs">#{order.orderId}</TableCell>
                            <TableCell>
                              <div className="font-medium text-xs">{order.user?.name || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">{order.user?.email || 'N/A'}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-xs">{order.provider?.name || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">{order.provider?.phone || 'N/A'}</div>
                            </TableCell>
                            <TableCell className="text-xs">{order.service?.title || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                order.status === 'completed' ? 'default' :
                                  order.status === 'pending' ? 'secondary' :
                                    order.status === 'in_progress' ? 'outline' :
                                      'destructive'
                              } className="text-xs">
                                {order.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-bold text-xs">
                              {formatCurrency(order.totalAmount || 0)}
                            </TableCell>
                            <TableCell className="text-xs">{formatDate(order.orderDate || order.createdAt)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Offers */}
                        {sortData(filteredOffers, sortField, sortDirection).map((offer: any) => (
                          <TableRow key={`offer-${offer.id}`} className="hover:bg-purple-50">
                            <TableCell>
                              <Badge variant="secondary" className="bg-purple-600 text-xs">Offer</Badge>
                            </TableCell>
                            <TableCell className="font-medium text-xs">#{offer.id}</TableCell>
                            <TableCell>
                              <div className="font-medium text-xs">-</div>
                              <div className="text-xs text-muted-foreground">Offer</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-xs">{offer.provider.name}</div>
                              {offer.provider.isVerified && (
                                <Badge variant="secondary" className="text-xs">Verified</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs">{offer.service.title}</TableCell>
                            <TableCell>
                              {offer.isActive ? (
                                <Badge variant="default" className="text-xs">Active</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Expired</Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-bold text-green-600 text-xs">
                              {formatCurrency(offer.offerPrice)}
                            </TableCell>
                            <TableCell className="text-xs">{formatDate(offer.startDate)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                        {/* Empty State */}
                        {filteredInvoices.length === 0 && filteredAllOrders.length === 0 && filteredOffers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-4">
                              <div className="text-muted-foreground text-sm">No financial data found</div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="space-y-3">
              <Card>
                <CardHeader className=" flex items-center justify-between pb-3">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    Invoices
                  </CardTitle>
                  <div className="relative max-w-xs">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('invoiceId')}
                          >
                            Invoice ID {sortField === 'invoiceId' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('user.name')}
                          >
                            Customer {sortField === 'user.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('provider.name')}
                          >
                            Provider {sortField === 'provider.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('service.title')}
                          >
                            Service {sortField === 'service.title' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('totalAmount')}
                          >
                            Total {sortField === 'totalAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('discount')}
                          >
                            Discount {sortField === 'discount' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('commission')}
                          >
                            Commission {sortField === 'commission' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('netAmount')}
                          >
                            Net {sortField === 'netAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('paymentDate')}
                          >
                            Date {sortField === 'paymentDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead className="text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-4">
                              <div className="text-muted-foreground text-sm">No invoices found</div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortData(filteredInvoices, sortField, sortDirection).map((invoice: any) => (
                            <TableRow key={invoice.invoiceId} className="hover:bg-green-50">
                              <TableCell className="font-medium text-xs">#{invoice.invoiceId}</TableCell>
                              <TableCell>
                                <div className="font-medium text-xs">{invoice.user.name}</div>
                                <div className="text-xs text-muted-foreground">{invoice.user.email}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-xs">{invoice.provider.name}</div>
                                <div className="text-xs text-muted-foreground">{invoice.provider.phone}</div>
                              </TableCell>
                              <TableCell className="text-xs">{invoice.service.title}</TableCell>
                              <TableCell className="font-medium text-xs">{formatCurrency(invoice.totalAmount)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-green-600 text-xs">
                                  -{formatCurrency(invoice.discount)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-orange-600 text-xs">
                                -{formatCurrency(invoice.commission)}
                              </TableCell>
                              <TableCell className="font-bold text-green-600 text-xs">
                                {formatCurrency(invoice.netAmount - invoice.commission)}
                              </TableCell>
                              <TableCell className="text-xs">{formatDate(invoice.paymentDate)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Eye className="h-3 w-3" />
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
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-3">
              <Card>
                <CardHeader className=" flex items-center justify-between pb-3">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    All Orders
                  </CardTitle>
                  <div className="relative max-w-xs">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('orderId')}
                          >
                            Order ID {sortField === 'orderId' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('user.name')}
                          >
                            Customer {sortField === 'user.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('provider.name')}
                          >
                            Provider {sortField === 'provider.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('service.title')}
                          >
                            Service {sortField === 'service.title' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('status')}
                          >
                            Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('totalAmount')}
                          >
                            Amount {sortField === 'totalAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('commissionAmount')}
                          >
                            Commission {sortField === 'commissionAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('orderDate')}
                          >
                            Date {sortField === 'orderDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('invoice.paymentStatus')}
                          >
                            Payment {sortField === 'invoice.paymentStatus' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead className="text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAllOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center py-4">
                              <div className="text-muted-foreground text-sm">No orders found</div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortData(filteredAllOrders, sortField, sortDirection).map((order: any) => (
                            <TableRow key={order.orderId} className="hover:bg-blue-50">
                              <TableCell className="font-medium text-xs">#{order.orderId}</TableCell>
                              <TableCell>
                                <div className="font-medium text-xs">{order.user?.name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{order.user?.email || 'N/A'}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-xs">{order.provider?.name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{order.provider?.phone || 'N/A'}</div>
                              </TableCell>
                              <TableCell className="text-xs">{order.service?.title || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  order.status === 'completed' ? 'default' :
                                    order.status === 'pending' ? 'secondary' :
                                      order.status === 'in_progress' ? 'outline' :
                                        'destructive'
                                } className="text-xs">
                                  {order.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-xs">{formatCurrency(order.totalAmount || 0)}</TableCell>
                              <TableCell className="text-orange-600 text-xs">
                                -{formatCurrency(order.commissionAmount || 0)}
                              </TableCell>
                              <TableCell className="text-xs">{formatDate(order.orderDate)}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  order.invoice?.paymentStatus === 'paid' ? 'default' :
                                    order.invoice?.paymentStatus === 'pending' ? 'secondary' :
                                      order.invoice?.paymentStatus === 'failed' ? 'destructive' :
                                        'outline'
                                } className="text-xs">
                                  {order.invoice?.paymentStatus?.toUpperCase() || 'NO INVOICE'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Eye className="h-3 w-3" />
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
            </TabsContent>

            {/* Offers Tab */}
            <TabsContent value="offers" className="space-y-3">
              <Card>
                <CardHeader className=" flex items-center justify-between pb-3">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Gift className="h-4 w-4" />
                    Offers & Discounts
                  </CardTitle>
                  <div className="relative max-w-xs">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search offers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('provider.name')}
                          >
                            Provider {sortField === 'provider.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('service.title')}
                          >
                            Service {sortField === 'service.title' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('originalPrice')}
                          >
                            Original {sortField === 'originalPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('offerPrice')}
                          >
                            Offer {sortField === 'offerPrice' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('discountAmount')}
                          >
                            Discount {sortField === 'discountAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('discountPercentage')}
                          >
                            % {sortField === 'discountPercentage' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('startDate')}
                          >
                            Valid Period {sortField === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead
                            className="text-xs cursor-pointer hover:bg-slate-50 select-none"
                            onClick={() => handleSort('isActive')}
                          >
                            Status {sortField === 'isActive' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead className="text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOffers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-4">
                              <div className="text-muted-foreground text-sm">No offers found</div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortData(filteredOffers, sortField, sortDirection).map((offer: any) => (
                            <TableRow key={offer.id} className="hover:bg-purple-50">
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium">
                                      {offer.provider.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-xs">{offer.provider.name}</div>
                                    {offer.provider.isVerified && (
                                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-xs">{offer.service.title}</div>
                                <div className="text-xs text-muted-foreground line-clamp-1">
                                  {offer.service.description}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-xs">{formatCurrency(offer.originalPrice)}</TableCell>
                              <TableCell className="font-medium text-green-600 text-xs">{formatCurrency(offer.offerPrice)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-green-600 text-xs">
                                  -{formatCurrency(offer.discountAmount)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {offer.discountPercentage.toFixed(1)}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-xs">
                                  <div>{formatDate(offer.startDate)}</div>
                                  <div className="text-muted-foreground">to {formatDate(offer.endDate)}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {offer.isActive ? (
                                  <Badge variant="default" className="text-xs">Active</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Expired</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Eye className="h-3 w-3" />
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
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 