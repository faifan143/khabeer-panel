"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useInvoices } from '@/lib/api/hooks/useInvoices'
import { formatCurrency } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import {
  DollarSign,
  Eye,
  Search,
  TrendingUp,
  Users,
  Gift,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useMemo, useState } from 'react'

export default function IncomePage() {
  const { i18n } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)

  // Fetch invoices
  const { data: invoicesResponse, isLoading } = useInvoices({
    search: searchTerm,
    paymentStatus: statusFilter === 'all' ? undefined : statusFilter,
    page: 1,
    limit: 1000
  })

  const invoices = useMemo(() => invoicesResponse?.data || [], [invoicesResponse?.data])

  // Calculate financial summary from invoices data
  const financialSummary = useMemo(() => {
    if (!invoices.length) {
      return {
        totalRevenue: 0,
        totalCommission: 0,
        totalDiscounts: 0,
        netIncome: 0,
        totalTransactions: 0,
        paidAmount: 0,
        pendingAmount: 0
      }
    }

    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0)
    const totalCommission = invoices.reduce((sum, invoice) => sum + (invoice.commission || 0), 0)
    const totalDiscounts = invoices.reduce((sum, invoice) => sum + (invoice.discount || 0), 0)
    const netIncome = totalRevenue - totalCommission
    const paidAmount = invoices
      .filter(invoice => invoice.paymentStatus === 'paid')
      .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0)
    const pendingAmount = invoices
      .filter(invoice => invoice.paymentStatus === 'unpaid')
      .reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0)

    return {
      totalRevenue,
      totalCommission,
      totalDiscounts,
      netIncome,
      totalTransactions: invoices.length,
      paidAmount,
      pendingAmount
    }
  }, [invoices])

  // Filter invoices based on search term
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice: any) =>
      invoice.orderId?.toString().includes(searchTerm.toLowerCase()) ||
      invoice.order?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.order?.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.order?.service?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [invoices, searchTerm])

  // Sort data
  const sortedInvoices = useMemo(() => {
    if (!sortField) return filteredInvoices

    return [...filteredInvoices].sort((a: any, b: any) => {
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
  }, [filteredInvoices, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsInvoiceDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { variant: 'default' as const, label: 'Paid', className: 'bg-green-100 text-green-800' },
      unpaid: { variant: 'secondary' as const, label: 'Unpaid', className: 'bg-yellow-100 text-yellow-800' },
      failed: { variant: 'destructive' as const, label: 'Failed', className: 'bg-red-100 text-red-800' },
      refunded: { variant: 'outline' as const, label: 'Refunded', className: 'bg-blue-100 text-blue-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status, className: 'bg-gray-100 text-gray-800' }
    return <Badge variant={config.variant} className={`text-xs ${config.className}`}>{config.label}</Badge>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.totalRevenue, i18n.language)}</div>
                <p className="text-xs text-muted-foreground">{financialSummary.totalTransactions} invoices</p>
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
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(financialSummary.netIncome, i18n.language)}</div>
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
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(financialSummary.totalCommission, i18n.language)}</div>
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
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(financialSummary.totalDiscounts, i18n.language)}</div>
                <p className="text-xs text-muted-foreground">Offer savings</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Paid Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(financialSummary.paidAmount, i18n.language)}</div>
                <p className="text-xs text-muted-foreground">Completed payments</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Pending Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(financialSummary.pendingAmount, i18n.language)}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>
          </div>

          {/* Income Table */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Invoice Details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete breakdown of all invoices and payment statuses
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice ID, customer, provider, or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('id')}
                      >
                        Invoice ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('order.provider.name')}
                      >
                        Provider {sortField === 'order.provider.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('order.user.name')}
                      >
                        Customer {sortField === 'order.user.name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        Invoice Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('order.service.title')}
                      >
                        Service {sortField === 'order.service.title' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('totalAmount')}
                      >
                        Total Amount {sortField === 'totalAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('commission')}
                      >
                        Commission {sortField === 'commission' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('netAmount')}
                      >
                        Net Amount {sortField === 'netAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="font-semibold">Payment Status</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {searchTerm ? 'No invoices found matching your search' : 'No invoices available'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedInvoices.map((invoice: any) => (
                        <TableRow key={invoice.id} className="hover:bg-gray-50/50">
                          <TableCell>
                            <div className="font-medium text-gray-900">#{invoice.id}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{invoice.order?.provider?.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{invoice.order?.provider?.phone || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{invoice.order?.user?.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{invoice.order?.user?.email || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(invoice.createdAt)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{invoice.order?.service?.title || 'N/A'}</div>
                            {invoice.order?.service?.category?.titleEn && (
                              <div className="text-sm text-muted-foreground">
                                {invoice.order.service.category.titleEn}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-green-600">
                              {formatCurrency(invoice.totalAmount || 0, i18n.language)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-orange-600">
                              {formatCurrency(invoice.commission || 0, i18n.language)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-blue-600">
                              {formatCurrency(invoice.netAmount || 0, i18n.language)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(invoice.paymentStatus)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewInvoice(invoice)}
                            >
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

        {/* Invoice Details Dialog */}
        <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                Complete information about invoice #{selectedInvoice?.id}
              </DialogDescription>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Invoice ID</Label>
                    <p className="text-lg font-semibold">#{selectedInvoice.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Order ID</Label>
                    <p className="text-lg font-semibold">#{selectedInvoice.orderId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                    <p className="text-sm">{formatDate(selectedInvoice.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Payment Status</Label>
                    <div className="mt-1">{getPaymentStatusBadge(selectedInvoice.paymentStatus)}</div>
                  </div>
                </div>

                <Separator />

                {/* Customer & Provider Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Customer Information</h4>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm text-muted-foreground">Name</Label>
                        <p className="font-medium">{selectedInvoice.order?.user?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Email</Label>
                        <p className="font-medium">{selectedInvoice.order?.user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Phone</Label>
                        <p className="font-medium">{selectedInvoice.order?.user?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Provider Information</h4>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm text-muted-foreground">Name</Label>
                        <p className="font-medium">{selectedInvoice.order?.provider?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Email</Label>
                        <p className="font-medium">{selectedInvoice.order?.provider?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Phone</Label>
                        <p className="font-medium">{selectedInvoice.order?.provider?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Service Details */}
                <div>
                  <h4 className="font-semibold mb-3">Service Details</h4>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">Service Title</Label>
                      <p className="font-medium">{selectedInvoice.order?.service?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Description</Label>
                      <p className="text-sm text-muted-foreground">{selectedInvoice.order?.service?.description || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Financial Summary */}
                <div>
                  <h4 className="font-semibold mb-3">Financial Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Total Amount</Label>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(selectedInvoice.totalAmount, i18n.language)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Discount</Label>
                      <p className="text-lg font-medium text-purple-600">{formatCurrency(selectedInvoice.discount, i18n.language)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Commission</Label>
                      <p className="text-lg font-medium text-orange-600">{formatCurrency(selectedInvoice.commission, i18n.language)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Net Amount</Label>
                      <p className="text-xl font-bold text-blue-600">{formatCurrency(selectedInvoice.netAmount, i18n.language)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                {selectedInvoice.paymentStatus === 'paid' && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">Payment Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Payment Date</Label>
                          <p className="font-medium">{selectedInvoice.paymentDate ? formatDate(selectedInvoice.paymentDate) : 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Payment Method</Label>
                          <p className="font-medium">{selectedInvoice.paymentMethod || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </ProtectedRoute>
  )
} 