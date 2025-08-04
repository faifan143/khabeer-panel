"use client"

import { useState, useEffect } from 'react'
import { AdminLayout } from "@/components/layout/admin-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign,
  TrendingUp,
  FileText,
  Gift,
  Users,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Star,
  Package
} from 'lucide-react'
import { FinanceService, type InvoiceData, type OfferData, type FinancialSummary } from '@/lib/api/services/finance.service'
import { showError } from '@/lib/utils/toast'

export default function IncomePage() {
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [offers, setOffers] = useState<OfferData[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all-data')

  useEffect(() => {
    loadFinancialData()
  }, []) // Only run on mount

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      const [summary, invoiceData, ordersData, offerData] = await Promise.all([
        FinanceService.getFinancialSummary(startDate || undefined, endDate || undefined),
        FinanceService.getRevenueReport(startDate || undefined, endDate || undefined),
        FinanceService.getAllOrdersReport(startDate || undefined, endDate || undefined),
        FinanceService.getOffers()
      ])

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
  }

  const handleApplyFilters = async () => {
    try {
      setLoading(true)
      const [summary, invoiceData, ordersData, offerData] = await Promise.all([
        FinanceService.getFinancialSummary(startDate || undefined, endDate || undefined),
        FinanceService.getRevenueReport(startDate || undefined, endDate || undefined),
        FinanceService.getAllOrdersReport(startDate || undefined, endDate || undefined),
        FinanceService.getOffers()
      ])

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
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.service.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredOffers = offers.filter(offer =>
    offer.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.service.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAllOrders = allOrders.filter(order =>
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { variant: 'default' as const, label: 'Paid' },
      pending: { variant: 'secondary' as const, label: 'Pending' },
      failed: { variant: 'destructive' as const, label: 'Failed' },
      refunded: { variant: 'outline' as const, label: 'Refunded' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading financial data...</div>
      </div>
    )
  }

  if (!financialSummary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No financial data available</div>
          <div className="text-muted-foreground">Try refreshing the page or check your connection</div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Income & Finance</h1>
              <p className="text-muted-foreground">
                Monitor revenue, commissions, discounts, and financial performance
              </p>
            </div>
            <Button onClick={loadFinancialData} variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>

          {/* Financial Summary Cards */}
          {financialSummary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(financialSummary.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    {financialSummary.totalTransactions} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(financialSummary.netIncome)}</div>
                  <p className="text-xs text-muted-foreground">
                    After commissions & discounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(financialSummary.totalCommission)}</div>
                  <p className="text-xs text-muted-foreground">
                    Provider commissions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(financialSummary.totalDiscounts)}</div>
                  <p className="text-xs text-muted-foreground">
                    {financialSummary.activeOffers} active offers
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
              <CardDescription>Filter and search through financial data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search invoices, offers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={handleApplyFilters} className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Comprehensive Data View */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all-data" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                All Financial Data ({invoices.length + allOrders.length + offers.length})
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Invoices ({invoices.length})
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                All Orders ({allOrders.length})
              </TabsTrigger>
              <TabsTrigger value="offers" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Offers ({offers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-data" className="space-y-4">
              {/* Summary Cards for All Data */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{invoices.length + allOrders.length + offers.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Invoices: {invoices.length} | Orders: {allOrders.length} | Offers: {offers.length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(financialSummary?.totalRevenue || 0)}</div>
                    <p className="text-xs text-muted-foreground">
                      From {invoices.length} paid invoices
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {allOrders.filter(order => order.status !== 'completed').length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {allOrders.filter(order => order.status === 'pending').length} pending
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
                    <Gift className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{offers.filter(offer => offer.isActive).length}</div>
                    <p className="text-xs text-muted-foreground">
                      {offers.length} total offers
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Complete Financial Overview</CardTitle>
                  <CardDescription>
                    Comprehensive view of all invoices, orders, and offers with detailed financial breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Net Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Invoices Data */}
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={`invoice-${invoice.invoiceId}`} className="bg-green-50">
                          <TableCell>
                            <Badge variant="default" className="bg-green-600">Invoice</Badge>
                          </TableCell>
                          <TableCell className="font-medium">#{invoice.invoiceId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{invoice.user.name}</div>
                              <div className="text-sm text-muted-foreground">{invoice.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{invoice.provider.name}</div>
                              <div className="text-sm text-muted-foreground">{invoice.provider.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{invoice.service.title}</TableCell>
                          <TableCell>
                            <Badge variant="default">Paid</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-600">
                              -{formatCurrency(invoice.discount)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-orange-600">
                            -{formatCurrency(invoice.commission)}
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(invoice.netAmount - invoice.commission)}
                          </TableCell>
                          <TableCell>{formatDate(invoice.paymentDate)}</TableCell>
                          <TableCell>
                            <Badge variant="default">PAID</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* All Orders Data */}
                      {filteredAllOrders.map((order) => (
                        <TableRow key={`order-${order.orderId}`} className="bg-blue-50">
                          <TableCell>
                            <Badge variant="outline" className="border-blue-600 text-blue-600">Order</Badge>
                          </TableCell>
                          <TableCell className="font-medium">#{order.orderId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.user?.name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">{order.user?.email || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.provider?.name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">{order.provider?.phone || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>{order.service?.title || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'completed' ? 'default' :
                                order.status === 'pending' ? 'secondary' :
                                  order.status === 'in_progress' ? 'outline' :
                                    'destructive'
                            }>
                              {order.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(order.totalAmount || 0)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-600">
                              -{formatCurrency(order.discount || 0)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-orange-600">
                            -{formatCurrency(order.commissionAmount || 0)}
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency((order.totalAmount || 0) - (order.commissionAmount || 0))}
                          </TableCell>
                          <TableCell>{formatDate(order.orderDate || order.createdAt)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.invoice?.paymentStatus === 'paid' ? 'default' :
                                order.invoice?.paymentStatus === 'pending' ? 'secondary' :
                                  order.invoice?.paymentStatus === 'failed' ? 'destructive' :
                                    'outline'
                            }>
                              {order.invoice?.paymentStatus?.toUpperCase() || 'NO INVOICE'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Offers Data */}
                      {filteredOffers.map((offer) => (
                        <TableRow key={`offer-${offer.id}`} className="bg-purple-50">
                          <TableCell>
                            <Badge variant="secondary" className="bg-purple-600">Offer</Badge>
                          </TableCell>
                          <TableCell className="font-medium">#{offer.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">-</div>
                              <div className="text-sm text-muted-foreground">Offer</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{offer.provider.name}</div>
                              {offer.provider.isVerified && (
                                <Badge variant="secondary" className="text-xs">Verified</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{offer.service.title}</TableCell>
                          <TableCell>
                            {offer.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Expired</Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(offer.originalPrice)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-600">
                              -{formatCurrency(offer.discountAmount)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-orange-600">-</TableCell>
                          <TableCell className="font-bold text-green-600">
                            {formatCurrency(offer.offerPrice)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(offer.startDate)}</div>
                              <div className="text-muted-foreground">to {formatDate(offer.endDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">OFFER</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Empty State */}
                      {filteredInvoices.length === 0 && filteredAllOrders.length === 0 && filteredOffers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={13} className="text-center py-8">
                            <div className="text-muted-foreground">No financial data found</div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>
                    Detailed view of all invoices with payment status and financial breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Net Amount</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            <div className="text-muted-foreground">No invoices found</div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.invoiceId}>
                            <TableCell className="font-medium">#{invoice.invoiceId}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{invoice.user.name}</div>
                                <div className="text-sm text-muted-foreground">{invoice.user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{invoice.provider.name}</div>
                                <div className="text-sm text-muted-foreground">{invoice.provider.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>{invoice.service.title}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-green-600">
                                -{formatCurrency(invoice.discount)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-orange-600">
                              -{formatCurrency(invoice.commission)}
                            </TableCell>
                            <TableCell className="font-bold">
                              {formatCurrency(invoice.netAmount - invoice.commission)}
                            </TableCell>
                            <TableCell>{formatDate(invoice.paymentDate)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                    Complete view of all orders with their status and financial details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAllOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            <div className="text-muted-foreground">No orders found</div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAllOrders.map((order) => (
                          <TableRow key={order.orderId}>
                            <TableCell className="font-medium">#{order.orderId}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.user?.name || 'N/A'}</div>
                                <div className="text-sm text-muted-foreground">{order.user?.email || 'N/A'}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.provider?.name || 'N/A'}</div>
                                <div className="text-sm text-muted-foreground">{order.provider?.phone || 'N/A'}</div>
                              </div>
                            </TableCell>
                            <TableCell>{order.service?.title || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                order.status === 'completed' ? 'default' :
                                  order.status === 'pending' ? 'secondary' :
                                    order.status === 'in_progress' ? 'outline' :
                                      'destructive'
                              }>
                                {order.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(order.totalAmount || 0)}</TableCell>
                            <TableCell className="text-orange-600">
                              -{formatCurrency(order.commissionAmount || 0)}
                            </TableCell>
                            <TableCell>{formatDate(order.orderDate)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                order.invoice?.paymentStatus === 'paid' ? 'default' :
                                  order.invoice?.paymentStatus === 'pending' ? 'secondary' :
                                    order.invoice?.paymentStatus === 'failed' ? 'destructive' :
                                      'outline'
                              }>
                                {order.invoice?.paymentStatus?.toUpperCase() || 'NO INVOICE'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Offers & Discounts</CardTitle>
                  <CardDescription>
                    Active and expired offers with discount details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Original Price</TableHead>
                        <TableHead>Offer Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Discount %</TableHead>
                        <TableHead>Valid Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOffers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <div className="text-muted-foreground">No offers found</div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOffers.map((offer) => (
                          <TableRow key={offer.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium">
                                    {offer.provider.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{offer.provider.name}</div>
                                  {offer.provider.isVerified && (
                                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{offer.service.title}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {offer.service.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(offer.originalPrice)}</TableCell>
                            <TableCell className="font-medium text-green-600">{formatCurrency(offer.offerPrice)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-green-600">
                                -{formatCurrency(offer.discountAmount)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {offer.discountPercentage.toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{formatDate(offer.startDate)}</div>
                                <div className="text-muted-foreground">to {formatDate(offer.endDate)}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {offer.isActive ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Expired</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Financial Summary Footer */}
          {financialSummary && (
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">Financial Summary</CardTitle>
                <CardDescription>
                  Complete overview of platform financial performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(financialSummary.totalRevenue)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(financialSummary.totalCommission)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Commissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(financialSummary.totalDiscounts)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Discounts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(financialSummary.netIncome)}
                    </div>
                    <div className="text-sm text-muted-foreground">Net Income</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{financialSummary.totalInvoices}</div>
                      <div className="text-sm text-muted-foreground">Total Invoices</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{financialSummary.totalOffers}</div>
                      <div className="text-sm text-muted-foreground">Total Offers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{financialSummary.activeOffers}</div>
                      <div className="text-sm text-muted-foreground">Active Offers</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 