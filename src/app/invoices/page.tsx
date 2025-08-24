"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useInvoices, useInvoiceStats, useUpdatePaymentStatus, useMarkAsPaid, useDeleteInvoice } from '@/lib/api/hooks/useInvoices'
import { formatCurrency } from '@/lib/utils'
import { Invoice } from '@/lib/types/invoice'
import {
  DollarSign,
  Eye,
  Search,
  Filter,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useMemo, useState } from 'react'
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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
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

  const handlePaymentStatusUpdate = async (invoiceId: number, newStatus: string) => {
    try {
      await updatePaymentStatusMutation.mutateAsync({
        id: invoiceId,
        paymentStatus: newStatus,
        paymentMethod: paymentMethod || 'Admin Update'
      })
      setIsPaymentDialogOpen(false)
      setSelectedInvoice(null)
      setPaymentMethod('')
      refetch()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update payment status"
      toast.error(errorMessage)
    }
  }

  const handleMarkAsPaid = async (invoiceId: number) => {
    try {
      await markAsPaidMutation.mutateAsync({
        id: invoiceId,
        paymentMethod: paymentMethod || 'Admin Payment'
      })
      setIsPaymentDialogOpen(false)
      setSelectedInvoice(null)
      setPaymentMethod('')
      refetch()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to mark invoice as paid"
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

  const openPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsPaymentDialogOpen(true)
  }

  const openDeleteDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsDeleteDialogOpen(true)
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminLayout>
        <div className="container mx-auto py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Invoice Management</h1>
              <p className="text-muted-foreground">Manage payments and invoices for completed orders</p>
            </div>
            <Button onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Invoices"
                value={stats.total}
                icon={DollarSign}
                color="bg-blue-500"
              />
              <StatCard
                title="Unpaid Amount"
                value={formatCurrency(stats.pendingAmount)}
                icon={AlertCircle}
                color="bg-yellow-500"
                subtitle={`${stats.unpaid} invoices`}
              />
              <StatCard
                title="Paid Amount"
                value={formatCurrency(stats.paidAmount)}
                icon={CheckCircle}
                color="bg-green-500"
                subtitle={`${stats.paid} invoices`}
              />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(stats.totalAmount)}
                icon={DollarSign}
                color="bg-purple-500"
              />
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All ({invoices.length})</TabsTrigger>
                  <TabsTrigger value="unpaid">Unpaid ({unpaidInvoices.length})</TabsTrigger>
                  <TabsTrigger value="paid">Paid ({paidInvoices.length})</TabsTrigger>
                  <TabsTrigger value="failed">Failed ({failedInvoices.length})</TabsTrigger>
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
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openPaymentDialog(invoice)}
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Payment
                                </Button>
                                {invoice.paymentStatus === 'unpaid' && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleMarkAsPaid(invoice.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark Paid
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDeleteDialog(invoice)}
                                >
                                  <Trash2 className="h-4 w-4" />
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

        {/* Payment Status Update Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Payment Status</DialogTitle>
              <DialogDescription>
                Update the payment status for invoice #{selectedInvoice?.id}
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
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => handlePaymentStatusUpdate(selectedInvoice!.id, 'paid')}
                  disabled={updatePaymentStatusMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handlePaymentStatusUpdate(selectedInvoice!.id, 'failed')}
                  disabled={updatePaymentStatusMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Failed
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Invoice</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete invoice #{selectedInvoice?.id}? This action cannot be undone.
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
