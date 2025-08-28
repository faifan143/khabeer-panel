"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDeleteInvoice, useInvoices, useInvoiceStats, useMarkAsPaid, useUpdatePaymentStatus } from '@/lib/api/hooks/useInvoices'
import { Invoice } from '@/lib/types/invoice'
import { formatCurrency } from '@/lib/utils'
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Filter,
  RefreshCw,
  Trash2,
  XCircle
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

// Loading Skeleton Components
const InvoiceCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-muted rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="h-3 bg-muted rounded w-1/3"></div>
        </div>
        <div className="h-6 bg-muted rounded w-16"></div>
      </div>
    </CardContent>
  </Card>
)

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle
}: {
  title: string
  value: string | number
  icon: any
  color: string
  subtitle?: string
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </CardContent>
  </Card>
)

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'unpaid':
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'refunded':
      return <RefreshCw className="h-4 w-4 text-blue-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>
    case 'unpaid':
      return <Badge variant="secondary">Unpaid</Badge>
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>
    case 'refunded':
      return <Badge variant="outline">Refunded</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false)
  const [isMarkFailedDialogOpen, setIsMarkFailedDialogOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Fetch invoices and stats
  const { data: invoicesResponse, isLoading, refetch } = useInvoices({
    search: searchTerm,
    paymentStatus: statusFilter === 'all' ? undefined : statusFilter,
    startDate,
    endDate,
    page: 1,
    limit: 1000
  })

  const { data: stats } = useInvoiceStats()

  // Mutations
  const updatePaymentStatusMutation = useUpdatePaymentStatus()
  const markAsPaidMutation = useMarkAsPaid()
  const deleteInvoiceMutation = useDeleteInvoice()

  const invoices = invoicesResponse?.data || []

  // Filter invoices by status for tabs
  const unpaidInvoices = invoices.filter(invoice => invoice.paymentStatus === 'unpaid')
  const paidInvoices = invoices.filter(invoice => invoice.paymentStatus === 'paid')
  const failedInvoices = invoices.filter(invoice => invoice.paymentStatus === 'failed')

  const getCurrentInvoices = () => {
    switch (activeTab) {
      case "unpaid":
        return unpaidInvoices
      case "paid":
        return paidInvoices
      case "failed":
        return failedInvoices
      default:
        return invoices
    }
  }

  const currentInvoices = getCurrentInvoices()



  const handleMarkAsPaid = async (invoiceId: number) => {
    try {
      await markAsPaidMutation.mutateAsync({
        id: invoiceId,
        paymentMethod: paymentMethod || 'Admin Payment'
      })
      setIsMarkPaidDialogOpen(false)
      setSelectedInvoice(null)
      setPaymentMethod('')
      refetch()
      toast.success('Invoice marked as paid successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark invoice as paid"
      toast.error(errorMessage)
    }
  }

  const handleMarkAsFailed = async (invoiceId: number) => {
    try {
      await updatePaymentStatusMutation.mutateAsync({
        id: invoiceId,
        paymentStatus: 'failed',
        paymentMethod: 'Admin Update'
      })
      setIsMarkFailedDialogOpen(false)
      setSelectedInvoice(null)
      refetch()
      toast.success('Invoice marked as failed successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark invoice as failed"
      toast.error(errorMessage)
    }
  }

  const handleRefund = async (invoiceId: number) => {
    try {
      await updatePaymentStatusMutation.mutateAsync({
        id: invoiceId,
        paymentStatus: 'refunded',
        paymentMethod: 'Admin Refund'
      })
      setIsRefundDialogOpen(false)
      setSelectedInvoice(null)
      refetch()
      toast.success('Invoice marked as refunded successfully')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark invoice as refunded"
      toast.error(errorMessage)
    }
  }



  const handleDeleteInvoice = async (invoiceId: number) => {
    try {
      await deleteInvoiceMutation.mutateAsync(invoiceId)
      setIsDeleteDialogOpen(false)
      setSelectedInvoice(null)
      refetch()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete invoice"
      toast.error(errorMessage)
    }
  }



  const openDeleteDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsDeleteDialogOpen(true)
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminLayout>
        <div className="container mx-auto py-4 space-y-4">
          {/* Compact Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Invoice Management</h1>
            </div>
            <Button size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Compact Statistics Row */}
          {stats && (
            <div className="grid grid-cols-4 gap-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">{stats.total}</p>
                  <p className="text-xs text-blue-700">Total</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">{formatCurrency(stats.pendingAmount)}</p>
                  <p className="text-xs text-yellow-700">{stats.unpaid} unpaid</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{formatCurrency(stats.paidAmount)}</p>
                  <p className="text-xs text-green-700">{stats.paid} paid</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">{formatCurrency(stats.totalAmount)}</p>
                  <p className="text-xs text-purple-700">Revenue</p>
                </div>
              </div>
            </div>
          )}

          {/* Compact Filters */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Filter className="h-4 w-4 text-gray-600" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-36"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-36"
            />
          </div>

          {/* Invoices Table */}
          <Card>
            <CardContent className="pt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 h-9">
                  <TabsTrigger value="all" className="text-sm">All ({invoices.length})</TabsTrigger>
                  <TabsTrigger value="unpaid" className="text-sm">Unpaid ({unpaidInvoices.length})</TabsTrigger>
                  <TabsTrigger value="paid" className="text-sm">Paid ({paidInvoices.length})</TabsTrigger>
                  <TabsTrigger value="failed" className="text-sm">Failed ({failedInvoices.length})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <InvoiceCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : currentInvoices.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No invoices found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">#{invoice.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{invoice.order?.user.name}</p>
                                <p className="text-sm text-muted-foreground">{invoice.order?.user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{invoice.order?.provider.name}</p>
                                <p className="text-sm text-muted-foreground">{invoice.order?.provider.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{invoice.order?.service.title}</p>
                                <p className="text-sm text-muted-foreground">{formatCurrency(invoice.order?.service.price || 0)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{formatCurrency(invoice.totalAmount)}</p>
                                {invoice.discount > 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    -{formatCurrency(invoice.discount)} discount
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(invoice.paymentStatus)}
                                {getStatusBadge(invoice.paymentStatus)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{new Date(invoice.createdAt).toLocaleDateString()}</p>
                                <p className="text-muted-foreground">
                                  {new Date(invoice.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {/* Mark as Paid - Only for unpaid invoices */}
                                {invoice.paymentStatus === 'unpaid' && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8 px-3 bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                      setSelectedInvoice(invoice)
                                      setIsMarkPaidDialogOpen(true)
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark Paid
                                  </Button>
                                )}

                                {/* Mark as Failed - Only for unpaid invoices */}
                                {invoice.paymentStatus === 'unpaid' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                                    onClick={() => {
                                      setSelectedInvoice(invoice)
                                      setIsMarkFailedDialogOpen(true)
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Mark Failed
                                  </Button>
                                )}

                                {/* Refund - Only for paid invoices */}
                                {invoice.paymentStatus === 'paid' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                    onClick={() => {
                                      setSelectedInvoice(invoice)
                                      setIsRefundDialogOpen(true)
                                    }}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Refund
                                  </Button>
                                )}

                                {/* Reactivate - For failed invoices */}
                                {invoice.paymentStatus === 'failed' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                                    onClick={() => {
                                      setSelectedInvoice(invoice)
                                      setIsMarkPaidDialogOpen(true)
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Reactivate
                                  </Button>
                                )}

                                {/* Delete - Available for all statuses */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 hover:bg-red-100"
                                  onClick={() => openDeleteDialog(invoice)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>



        {/* Mark as Paid Confirmation Dialog */}
        <Dialog open={isMarkPaidDialogOpen} onOpenChange={setIsMarkPaidDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirm Mark as Paid</DialogTitle>
              <DialogDescription>
                Are you sure you want to mark invoice #{selectedInvoice?.id} as paid?
                {selectedInvoice && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-800">
                      <p><strong>Customer:</strong> {selectedInvoice.order?.user.name}</p>
                      <p><strong>Amount:</strong> {formatCurrency(selectedInvoice.totalAmount)}</p>
                    </div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Input
                  id="paymentMethod"
                  placeholder="e.g., Bank Transfer, Cash, etc."
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMarkPaidDialogOpen(false)
                    setPaymentMethod('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleMarkAsPaid(selectedInvoice!.id)}
                  disabled={markAsPaidMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Mark as Paid
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mark as Failed Confirmation Dialog */}
        <Dialog open={isMarkFailedDialogOpen} onOpenChange={setIsMarkFailedDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirm Mark as Failed</DialogTitle>
              <DialogDescription>
                Are you sure you want to mark invoice #{selectedInvoice?.id} as failed?
                {selectedInvoice && (
                  <div className="mt-2 p-3 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-800">
                      <p><strong>Customer:</strong> {selectedInvoice.order?.user.name}</p>
                      <p><strong>Amount:</strong> {formatCurrency(selectedInvoice.totalAmount)}</p>
                      <p className="mt-2 text-xs">This will mark the payment as failed and update the order status.</p>
                    </div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsMarkFailedDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleMarkAsFailed(selectedInvoice!.id)}
                disabled={updatePaymentStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Confirm Mark as Failed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Confirmation Dialog */}
        <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirm Refund</DialogTitle>
              <DialogDescription>
                Are you sure you want to refund invoice #{selectedInvoice?.id}?
                {selectedInvoice && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <p><strong>Customer:</strong> {selectedInvoice.order?.user.name}</p>
                      <p><strong>Amount:</strong> {formatCurrency(selectedInvoice.totalAmount)}</p>
                      <p className="mt-2 text-xs">This will mark the invoice as refunded and process the refund.</p>
                    </div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRefundDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => handleRefund(selectedInvoice!.id)}
                disabled={updatePaymentStatusMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Confirm Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Invoice</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete invoice #{selectedInvoice?.id}? This action cannot be undone.
                {selectedInvoice && (
                  <div className="mt-2 p-3 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-800">
                      <p><strong>Customer:</strong> {selectedInvoice.order?.user.name}</p>
                      <p><strong>Amount:</strong> {formatCurrency(selectedInvoice.totalAmount)}</p>
                    </div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteInvoice(selectedInvoice!.id)}
                disabled={deleteInvoiceMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </ProtectedRoute>
  )
}
