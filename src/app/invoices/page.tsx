"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
  MoreHorizontal,
  RefreshCw,
  Trash2,
  XCircle
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

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

export default function InvoicesPage() {
  const { t, i18n } = useTranslation()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('invoices.paid')}</Badge>
      case 'unpaid':
        return <Badge variant="secondary">{t('invoices.unpaid')}</Badge>
      case 'failed':
        return <Badge variant="destructive">{t('invoices.failed')}</Badge>
      case 'refunded':
        return <Badge variant="outline">{t('invoices.refunded')}</Badge>
      default:
        return <Badge variant="secondary">{t(`invoices.${status}`)}</Badge>
    }
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false)
  const [isMarkFailedDialogOpen, setIsMarkFailedDialogOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [isActionsDialogOpen, setIsActionsDialogOpen] = useState(false)
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

  // Extract invoices array from response
  const invoices = Array.isArray(invoicesResponse)
    ? invoicesResponse
    : (invoicesResponse?.data || [])

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
        paymentMethod: 'cash'
      })
      setIsMarkPaidDialogOpen(false)
      setSelectedInvoice(null)
      refetch()
      toast.success(t('invoices.invoiceMarkedAsPaid'))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('invoices.failedToMarkAsPaid')
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
      toast.success(t('invoices.invoiceMarkedAsFailed'))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('invoices.failedToMarkAsFailed')
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
      toast.success(t('invoices.invoiceRefunded'))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('invoices.failedToRefund')
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
      const errorMessage = error instanceof Error ? error.message : t('invoices.failedToDelete')
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
              <h1 className="text-2xl font-bold">{t('invoices.invoiceManagement')}</h1>
            </div>
            <Button size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('invoices.refresh')}
            </Button>
          </div>

          {/* Financial Statistics - 6 Boxes */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Total Provider Amount */}
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">{formatCurrency(stats.totalProviderAmount, i18n.language)}</p>
                  <p className="text-xs text-blue-700">{t('invoices.totalProviderAmount')}</p>
                </div>
              </div>

              {/* Total Commission */}
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{formatCurrency(stats.totalCommission, i18n.language)}</p>
                  <p className="text-xs text-green-700">{t('invoices.totalCommission')}</p>
                </div>
              </div>

              {/* Total Provider Net Amount */}
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">{formatCurrency(stats.totalProviderNetAmount, i18n.language)}</p>
                  <p className="text-xs text-purple-700">{t('invoices.totalProviderNetAmount')}</p>
                </div>
              </div>

              {/* Paid Provider Amount */}
              <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-900">{formatCurrency(stats.paidProviderAmount, i18n.language)}</p>
                  <p className="text-xs text-emerald-700">{t('invoices.paidProviderAmount')}</p>
                </div>
              </div>

              {/* Paid Commission */}
              <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-teal-900">{formatCurrency(stats.paidCommission, i18n.language)}</p>
                  <p className="text-xs text-teal-700">{t('invoices.paidCommission')}</p>
                </div>
              </div>

              {/* Pending Provider Amount */}
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">{formatCurrency(stats.pendingProviderAmount, i18n.language)}</p>
                  <p className="text-xs text-yellow-700">{t('invoices.pendingProviderAmount')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Compact Filters */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Filter className="h-4 w-4 text-gray-600" />
            <Input
              placeholder={t('invoices.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('invoices.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('invoices.all')}</SelectItem>
                <SelectItem value="unpaid">{t('invoices.unpaid')}</SelectItem>
                <SelectItem value="paid">{t('invoices.paid')}</SelectItem>
                <SelectItem value="failed">{t('invoices.failed')}</SelectItem>
                <SelectItem value="refunded">{t('invoices.refunded')}</SelectItem>
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
                  <TabsTrigger value="all" className="text-sm">{t('invoices.all')} ({invoices.length})</TabsTrigger>
                  <TabsTrigger value="unpaid" className="text-sm">{t('invoices.unpaid')} ({unpaidInvoices.length})</TabsTrigger>
                  <TabsTrigger value="paid" className="text-sm">{t('invoices.paid')} ({paidInvoices.length})</TabsTrigger>
                  <TabsTrigger value="failed" className="text-sm">{t('invoices.failed')} ({failedInvoices.length})</TabsTrigger>
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
                      <p className="text-muted-foreground">{t('invoices.noInvoicesFound')}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-left rtl:text-right">{t('invoices.tableHeaders.invoiceId')}</TableHead>
                          <TableHead className="text-left rtl:text-right">{t('invoices.tableHeaders.customer')}</TableHead>
                          <TableHead className="text-left rtl:text-right">{t('invoices.tableHeaders.provider')}</TableHead>
                          <TableHead className="text-left rtl:text-right">{t('invoices.tableHeaders.service')}</TableHead>
                          <TableHead className="text-left rtl:text-right">{t('invoices.tableHeaders.commission')}</TableHead>
                          <TableHead className="text-left rtl:text-right">{t('invoices.tableHeaders.mustPayforProvider')}</TableHead>
                          <TableHead className="text-left rtl:text-right">{t('invoices.tableHeaders.status')}</TableHead>
                          <TableHead className="text-left rtl:text-right">{t('invoices.tableHeaders.created')}</TableHead>
                          <TableHead className="text-left rtl:text-right">{t('invoices.tableHeaders.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">#{invoice.id}</TableCell>
                            <TableCell>
                              <div >
                                <p className="font-medium">{invoice.order?.user.name}</p>
                                <p dir="ltr" className="text-sm text-muted-foreground">{invoice.order?.user.email ?? invoice.order?.user.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{invoice.order?.provider.name}</p>
                                <p dir="ltr" className="text-sm text-muted-foreground">{invoice.order?.provider.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{invoice.order?.service.title}</p>
                                <p className="text-sm text-muted-foreground">{t("invoices.basePrice")} {formatCurrency(invoice.order?.service.price || 0, i18n.language)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{t("invoices.commission")}  {formatCurrency(invoice.commission, i18n.language)}</p>
                                <p className="font-medium">{t("invoices.amountAfterCommission")}  {formatCurrency(invoice.totalAmount - invoice.commission, i18n.language)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{formatCurrency(invoice.totalAmount, i18n.language)}</p>
                                {invoice.discount > 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    -{formatCurrency(invoice.discount, i18n.language)} {t('invoices.discount')}
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
                                <p>{t('orders.orderDate')}: {new Date(invoice.order?.orderDate).toLocaleDateString()}</p>
                                {invoice.paymentDate && <p>{t('orders.paymentDate')}: {invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : t('invoices.noPaymentDate')}</p>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3"
                                onClick={() => {
                                  setSelectedInvoice(invoice)
                                  setIsActionsDialogOpen(true)
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4 mr-1" />
                                {t('invoices.actions')}
                              </Button>
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
              <DialogTitle>{t('invoices.confirmMarkAsPaid')}</DialogTitle>
              <DialogDescription>
                {t('invoices.confirmMarkAsPaidDescription', { id: selectedInvoice?.id })}
                {selectedInvoice && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-800">
                      <p><strong>{t('invoices.customerLabel')}</strong> {selectedInvoice.order?.user.name}</p>
                      <p><strong>{t('invoices.amountLabel')}</strong> {formatCurrency(selectedInvoice.totalAmount, i18n.language)}</p>
                    </div>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsMarkPaidDialogOpen(false)}
              >
                {t('invoices.cancel')}
              </Button>
              <Button
                variant="default"
                onClick={() => handleMarkAsPaid(selectedInvoice!.id)}
                disabled={markAsPaidMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('invoices.markAsPaid')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mark as Failed Confirmation Dialog */}
        <Dialog open={isMarkFailedDialogOpen} onOpenChange={setIsMarkFailedDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t('invoices.confirmMarkAsFailed')}</DialogTitle>
              <DialogDescription>
                {t('invoices.confirmMarkAsFailedDescription', { id: selectedInvoice?.id })}
                {selectedInvoice && (
                  <div className="mt-2 p-3 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-800">
                      <p><strong>{t('invoices.customerLabel')}</strong> {selectedInvoice.order?.user.name}</p>
                      <p><strong>{t('invoices.amountLabel')}</strong> {formatCurrency(selectedInvoice.totalAmount, i18n.language)}</p>
                      <p className="mt-2 text-xs">{t('invoices.markAsFailedDescription')}</p>
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
                {t('invoices.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleMarkAsFailed(selectedInvoice!.id)}
                disabled={updatePaymentStatusMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t('invoices.markAsFailed')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Confirmation Dialog */}
        <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{t('invoices.confirmRefund')}</DialogTitle>
              <DialogDescription>
                {t('invoices.confirmRefundDescription', { id: selectedInvoice?.id })}
                {selectedInvoice && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <p><strong>{t('invoices.customerLabel')}</strong> {selectedInvoice.order?.user.name}</p>
                      <p><strong>{t('invoices.amountLabel')}</strong> {formatCurrency(selectedInvoice.totalAmount, i18n.language)}</p>
                      <p className="mt-2 text-xs">{t('invoices.refundDescription')}</p>
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
                {t('invoices.cancel')}
              </Button>
              <Button
                variant="default"
                onClick={() => handleRefund(selectedInvoice!.id)}
                disabled={updatePaymentStatusMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('invoices.refund')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('invoices.deleteInvoice')}</DialogTitle>
              <DialogDescription>
                {t('invoices.deleteInvoiceDescription', { id: selectedInvoice?.id })}
                {selectedInvoice && (
                  <div className="mt-2 p-3 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-800">
                      <p><strong>{t('invoices.customerLabel')}</strong> {selectedInvoice.order?.user.name}</p>
                      <p><strong>{t('invoices.amountLabel')}</strong> {formatCurrency(selectedInvoice.totalAmount, i18n.language)}</p>
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
                {t('invoices.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteInvoice(selectedInvoice!.id)}
                disabled={deleteInvoiceMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('invoices.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Compact Actions Dialog */}
        <Dialog open={isActionsDialogOpen} onOpenChange={setIsActionsDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader className="rtl:text-right">
              <DialogTitle className="text-lg">{t('invoices.actionsTitle', { id: selectedInvoice?.id })}</DialogTitle>
              {selectedInvoice && (
                <div className="text-sm text-muted-foreground">
                  {selectedInvoice.order?.user.name} <br />
                  {formatCurrency(selectedInvoice.totalAmount, i18n.language)}<br />
                  {t(`invoices.${selectedInvoice.paymentStatus}`)}
                </div>
              )}
            </DialogHeader>

            <div className="space-y-2">
              {/* Available Actions Based on Current Status */}
              {selectedInvoice?.paymentStatus === 'unpaid' && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 bg-green-50 border-green-200 hover:bg-green-100"
                    onClick={() => {
                      setIsActionsDialogOpen(false)
                      setIsMarkPaidDialogOpen(true)
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-3 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">{t('invoices.markAsPaidAction')}</div>
                      <div className="text-xs text-green-600">{t('invoices.commissionEarned')} {formatCurrency(selectedInvoice.commission || selectedInvoice.order?.commissionAmount || 0, i18n.language)}</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 bg-red-50 border-red-200 hover:bg-red-100"
                    onClick={() => {
                      setIsActionsDialogOpen(false)
                      setIsMarkFailedDialogOpen(true)
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-3 text-red-600" />
                    <div className="text-left">
                      <div className="font-medium">{t('invoices.markAsFailedAction')}</div>
                      <div className="text-xs text-red-600">{t('invoices.noCommissionEarned')}</div>
                    </div>
                  </Button>
                </>
              )}

              {selectedInvoice?.paymentStatus === 'paid' && (
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-blue-50 border-blue-200 hover:bg-blue-100"
                  onClick={() => {
                    setIsActionsDialogOpen(false)
                    setIsRefundDialogOpen(true)
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-3 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">{t('invoices.refund')}</div>
                    <div className="text-xs text-blue-600">{t('invoices.reverseFinancialCommitments')}</div>
                  </div>
                </Button>
              )}

              {selectedInvoice?.paymentStatus === 'failed' && (
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                  onClick={() => {
                    setIsActionsDialogOpen(false)
                    setIsMarkPaidDialogOpen(true)
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-3 text-yellow-600" />
                  <div className="text-left">
                    <div className="font-medium">{t('invoices.reactivate')}</div>
                    <div className="text-xs text-yellow-600">{t('invoices.readyForPayment')}</div>
                  </div>
                </Button>
              )}

              {/* Delete Action - Available for all statuses */}
              <Button
                variant="outline"
                className="w-full justify-start h-12 bg-red-50 border-red-200 hover:bg-red-100"
                onClick={() => {
                  setIsActionsDialogOpen(false)
                  openDeleteDialog(selectedInvoice!)
                }}
              >
                <Trash2 className="h-4 w-4 mr-3 text-red-600" />
                <div className="text-left">
                  <div className="font-medium">{t('invoices.deleteInvoiceAction')}</div>
                  <div className="text-xs text-red-600">
                    {selectedInvoice?.paymentStatus === 'paid' ? t('invoices.reverseFinancialCommitments') : t('invoices.noFinancialImpact')}
                  </div>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </ProtectedRoute>
  )
}
