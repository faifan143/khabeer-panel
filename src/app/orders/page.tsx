"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAdminAcceptOrder, useAdminCancelOrder, useAdminCompleteOrder, useAdminOrders, useAdminRejectOrder, useAdminUpdateOrderStatus, useDashboardStats } from "@/lib/api/hooks/useAdmin"
import { Order } from "@/lib/api/types"
import { formatCurrency } from "@/lib/utils"
import {
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    Filter,
    MapPin,
    Package,
    RefreshCw,
    Search,
    Truck,
    XCircle,
    Zap
} from "lucide-react"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"

// Loading Skeleton Components
const OrderCardSkeleton = () => (
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
    trend,
    description
}: {
    title: string
    value: string | number
    icon: any
    color: string
    trend?: { value: number; isPositive: boolean }
    description?: string
}) => (
    <Card className="group hover:shadow-md transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="px-4">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">{title}</p>
                    <div className="flex items-baseline space-x-2">
                        <p className="text-base font-bold text-gray-900">{value}</p>
                        {trend && (
                            <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {trend.isPositive ? <Zap className="h-3 w-3 mr-1" /> : <Zap className="h-3 w-3 mr-1 rotate-180" />}
                                {Math.abs(trend.value)}%
                            </div>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color} group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </div>
        </CardContent>
    </Card>
)

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'accepted':
            return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'in_progress':
            return 'bg-orange-100 text-orange-800 border-orange-200'
        case 'completed':
            return 'bg-green-100 text-green-800 border-green-200'
        case 'cancelled':
            return 'bg-red-100 text-red-800 border-red-200'
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pending':
            return <Clock className="h-4 w-4" />
        case 'accepted':
            return <CheckCircle className="h-4 w-4" />
        case 'in_progress':
            return <Truck className="h-4 w-4" />
        case 'completed':
            return <CheckCircle className="h-4 w-4" />
        case 'cancelled':
            return <XCircle className="h-4 w-4" />
        default:
            return <Package className="h-4 w-4" />
    }
}

export default function OrdersManagementPage() {
    const [activeTab, setActiveTab] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("list")
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
    const [cancelReason, setCancelReason] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [dateFilter, setDateFilter] = useState<string>("all")
    const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false)
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [acceptNotes, setAcceptNotes] = useState("")
    const [rejectReason, setRejectReason] = useState("")

    // Admin Orders hooks - using admin privileges
    const { data: ordersResponse, isLoading: ordersLoading, refetch: refetchOrders } = useAdminOrders(1, 1000) // Increased limit to get all orders

    // Also fetch dashboard stats to compare
    const { data: dashboardStats } = useDashboardStats()
    const updateStatusMutation = useAdminUpdateOrderStatus()
    const cancelOrderMutation = useAdminCancelOrder()
    const completeOrderMutation = useAdminCompleteOrder()
    const acceptOrderMutation = useAdminAcceptOrder()
    const rejectOrderMutation = useAdminRejectOrder()

    // Extract data from response
    const orders = (Array.isArray(ordersResponse) ? ordersResponse : ordersResponse?.data) as Order[] || []

    // Filter orders by status on frontend
    const pendingOrders = orders.filter(order => order.status === 'pending')
    const acceptedOrders = orders.filter(order => order.status === 'accepted')
    const inProgressOrders = orders.filter(order => order.status === 'in_progress')
    const completedOrders = orders.filter(order => order.status === 'completed')
    const cancelledOrders = orders.filter(order => order.status === 'cancelled')

    // Computed statistics
    const orderStats = useMemo(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
        const totalCommission = orders.reduce((sum, order) => sum + order.commissionAmount, 0)
        const completedRevenue = orders.filter(o => o.status === 'completed').reduce((sum, order) => sum + order.totalAmount, 0)
        const pendingRevenue = orders.filter(o => o.status === 'pending').reduce((sum, order) => sum + order.totalAmount, 0)

        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            inProgress: orders.filter(o => o.status === 'in_progress').length,
            completed: orders.filter(o => o.status === 'completed').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalCommission: Math.round(totalCommission * 100) / 100,
            completedRevenue: Math.round(completedRevenue * 100) / 100,
            pendingRevenue: Math.round(pendingRevenue * 100) / 100
        }
    }, [orders])

    // Filter orders based on active tab and search
    const getFilteredOrders = (orderList: Order[]) => {
        let filtered = orderList.filter(order =>
            order.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.provider?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.service?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.location?.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (statusFilter !== "all") {
            filtered = filtered.filter(order => order.status === statusFilter)
        }

        if (dateFilter !== "all") {
            const today = new Date()
            const orderDate = new Date()

            switch (dateFilter) {
                case "today":
                    filtered = filtered.filter(order => {
                        const orderDate = new Date(order.orderDate)
                        return orderDate.toDateString() === today.toDateString()
                    })
                    break
                case "week":
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                    filtered = filtered.filter(order => {
                        const orderDate = new Date(order.orderDate)
                        return orderDate >= weekAgo
                    })
                    break
                case "month":
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                    filtered = filtered.filter(order => {
                        const orderDate = new Date(order.orderDate)
                        return orderDate >= monthAgo
                    })
                    break
            }
        }

        return filtered
    }

    const getCurrentOrders = () => {
        switch (activeTab) {
            case "pending":
                return getFilteredOrders(pendingOrders)
            case "accepted":
                return getFilteredOrders(acceptedOrders)
            case "in_progress":
                return getFilteredOrders(inProgressOrders)
            case "completed":
                return getFilteredOrders(completedOrders)
            case "cancelled":
                return getFilteredOrders(cancelledOrders)
            default:
                return getFilteredOrders(orders)
        }
    }

    const currentOrders = getCurrentOrders()

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            await updateStatusMutation.mutateAsync({ id: orderId, status: newStatus })
            toast.success(`Order status updated to ${newStatus}`)
            setIsStatusDialogOpen(false)
            setSelectedOrder(null)
            refetchOrders()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update order status")
        }
    }

    const handleOrderCancel = async (orderId: number) => {
        try {
            await cancelOrderMutation.mutateAsync({ id: orderId, reason: cancelReason })
            toast.success("Order cancelled successfully")
            setIsCancelDialogOpen(false)
            setSelectedOrder(null)
            setCancelReason("")
            refetchOrders()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to cancel order")
        }
    }

    const handleOrderComplete = async (orderId: number) => {
        try {
            await completeOrderMutation.mutateAsync(orderId)
            toast.success("Order marked as completed")
            refetchOrders()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to complete order")
        }
    }

    const handleOrderAccept = async (orderId: number) => {
        try {
            await acceptOrderMutation.mutateAsync({ id: orderId, notes: acceptNotes })
            toast.success("Order accepted successfully")
            setIsAcceptDialogOpen(false)
            setSelectedOrder(null)
            setAcceptNotes("")
            refetchOrders()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to accept order")
        }
    }

    const handleOrderReject = async (orderId: number) => {
        try {
            await rejectOrderMutation.mutateAsync({ id: orderId, reason: rejectReason })
            toast.success("Order rejected successfully")
            setIsRejectDialogOpen(false)
            setSelectedOrder(null)
            setRejectReason("")
            refetchOrders()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reject order")
        }
    }

    const renderCurrency = (amount: number) => {
        const currencyString = formatCurrency(amount)
        const parts = currencyString.split(' OMR')
        return (
            <span className="font-semibold">
                {parts[0]}
                <span className="text-sm text-muted-foreground ml-1 font-normal">OMR</span>
            </span>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="space-y-8">
                    {/* Enhanced Header */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders Management</h1>
                                <p className="text-lg text-muted-foreground mt-1">
                                    Monitor and manage all orders across the platform
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => refetchOrders()}
                                    className="flex items-center space-x-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Refresh</span>
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setActiveTab("pending")}
                                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Manage Pending Orders</span>
                                </Button>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search orders by ID, user, provider, service..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-80"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>



                    {/* Enhanced Stats Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <StatCard
                            title="Total Orders"
                            value={orderStats.total}
                            icon={Package}
                            color="bg-gradient-to-br from-blue-500 to-indigo-600"
                            description="All orders"
                        />
                        <StatCard
                            title="Pending"
                            value={orderStats.pending}
                            icon={Clock}
                            color="bg-gradient-to-br from-yellow-500 to-orange-600"
                            description="Awaiting confirmation"
                        />
                        <StatCard
                            title="In Progress"
                            value={orderStats.inProgress}
                            icon={Truck}
                            color="bg-gradient-to-br from-orange-500 to-red-600"
                            description="Being processed"
                        />
                        <StatCard
                            title="Completed"
                            value={orderStats.completed}
                            icon={CheckCircle}
                            color="bg-gradient-to-br from-green-500 to-emerald-600"
                            description="Successfully delivered"
                        />
                        <StatCard
                            title="Total Revenue"
                            value={`${orderStats.totalRevenue} OMR`}
                            icon={DollarSign}
                            color="bg-gradient-to-br from-emerald-500 to-teal-600"
                            description="All time revenue"
                        />
                        <StatCard
                            title="Commission"
                            value={`${orderStats.totalCommission} OMR`}
                            icon={DollarSign}
                            color="bg-gradient-to-br from-purple-500 to-violet-600"
                            description="Platform earnings"
                        />
                    </div>

                    {/* Enhanced Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <TabsList className="grid w-auto grid-cols-6 bg-gray-100 p-1">
                                <TabsTrigger
                                    value="all"
                                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    All Orders
                                </TabsTrigger>
                                <TabsTrigger
                                    value="pending"
                                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Pending
                                </TabsTrigger>
                                <TabsTrigger
                                    value="accepted"
                                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Accepted
                                </TabsTrigger>
                                <TabsTrigger
                                    value="in_progress"
                                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    In Progress
                                </TabsTrigger>
                                <TabsTrigger
                                    value="completed"
                                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Completed
                                </TabsTrigger>
                                <TabsTrigger
                                    value="cancelled"
                                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Cancelled
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center space-x-3">
                                {/* Status Filter */}
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Date Filter */}
                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by date" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Time</SelectItem>
                                        <SelectItem value="today">Today</SelectItem>
                                        <SelectItem value="week">This Week</SelectItem>
                                        <SelectItem value="month">This Month</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* View Toggle */}
                                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                                    <Button
                                        variant={viewMode === "grid" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("grid")}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Package className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("list")}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Orders Display */}
                        <TabsContent value={activeTab} className="space-y-6">
                            {ordersLoading ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <OrderCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : viewMode === "grid" ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {currentOrders.map((order) => (
                                        <Card key={order.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 hover:from-blue-50/50 hover:to-indigo-50/50">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Badge variant="outline" className={`${getStatusColor(order.status)}`}>
                                                                {getStatusIcon(order.status)}
                                                                <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground font-mono">#{order.bookingId}</span>
                                                        </div>
                                                        <h3 className="font-semibold text-gray-900 mb-1">{order.service?.title}</h3>
                                                        <p className="text-sm text-muted-foreground mb-3">{order.service?.description}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Customer:</span>
                                                        <span className="font-medium">{order.user?.name}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Provider:</span>
                                                        <span className="font-medium">{order.provider?.name}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Amount:</span>
                                                        <span className="font-semibold text-green-600">{renderCurrency(order.totalAmount)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-muted-foreground">Date:</span>
                                                        <span className="font-medium">{formatDate(order.orderDate)}</span>
                                                    </div>
                                                    {order.location && (
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground truncate">{order.location}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedOrder(order)
                                                            setIsOrderDialogOpen(true)
                                                        }}
                                                        className="h-8 w-8 p-0 hover:bg-blue-100"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {order.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedOrder(order)
                                                                    setIsAcceptDialogOpen(true)
                                                                }}
                                                                className="h-8 w-8 p-0 hover:bg-green-100"
                                                                title="Accept Order"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedOrder(order)
                                                                    setIsRejectDialogOpen(true)
                                                                }}
                                                                className="h-8 w-8 p-0 hover:bg-red-100"
                                                                title="Reject Order"
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {order.status === 'in_progress' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOrderComplete(order.id)}
                                                            className="h-8 w-8 p-0 hover:bg-green-100"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="border-0 shadow-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="font-semibold">Service Name</TableHead>
                                                <TableHead className="font-semibold">Customer</TableHead>
                                                <TableHead className="font-semibold">Provider</TableHead>
                                                <TableHead className="font-semibold">Amount</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                                <TableHead className="font-semibold">Date</TableHead>
                                                <TableHead className="font-semibold text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentOrders.map((order) => (
                                                <TableRow key={order.id} className="hover:bg-gray-50/50">
                                                    <TableCell>
                                                        <div className="space-y-1">

                                                            <div className="text-sm text-muted-foreground">{order.service?.title}</div>

                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium text-gray-900">{order.user?.name}</div>
                                                            <div className="text-sm text-muted-foreground">{order.user?.phone}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium text-gray-900">{order.provider?.name}</div>
                                                            <div className="text-sm text-muted-foreground">{order.provider?.phone}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-semibold text-green-600">{renderCurrency(order.totalAmount)}</div>
                                                            <div className="text-xs text-muted-foreground">Commission: {renderCurrency(order.commissionAmount)}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`${getStatusColor(order.status)}`}>
                                                            {getStatusIcon(order.status)}
                                                            <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium">{formatDate(order.orderDate)}</div>
                                                            {order.scheduledDate && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    Scheduled: {formatDate(order.scheduledDate)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedOrder(order)
                                                                    setIsOrderDialogOpen(true)
                                                                }}
                                                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            {order.status === 'pending' && (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedOrder(order)
                                                                            setIsAcceptDialogOpen(true)
                                                                        }}
                                                                        className="h-8 w-8 p-0 hover:bg-green-100"
                                                                        title="Accept Order"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedOrder(order)
                                                                            setIsRejectDialogOpen(true)
                                                                        }}
                                                                        className="h-8 w-8 p-0 hover:bg-red-100"
                                                                        title="Reject Order"
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {order.status === 'in_progress' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleOrderComplete(order.id)}
                                                                    className="h-8 w-8 p-0 hover:bg-green-100"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            )}

                            {currentOrders.length === 0 && !ordersLoading && (
                                <Card className="border-0 shadow-lg">
                                    <CardContent className="p-12 text-center">
                                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                                        <p className="text-muted-foreground">
                                            {searchTerm ? `No orders match your search "${searchTerm}"` : `No orders in ${activeTab} status`}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Order Details Dialog */}
                    <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] max-h-[90vh] w-full overflow-hidden">
                            <DialogHeader className="flex-shrink-0">
                                <DialogTitle className="text-xl">Order Details</DialogTitle>
                                <DialogDescription>
                                    Complete information about this order
                                </DialogDescription>
                            </DialogHeader>
                            {selectedOrder && (
                                <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] pr-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Booking ID</Label>
                                            <div className="text-sm font-mono bg-gray-100 p-2 rounded break-all">#{selectedOrder.bookingId}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Status</Label>
                                            <Badge variant="outline" className={`${getStatusColor(selectedOrder.status)}`}>
                                                {getStatusIcon(selectedOrder.status)}
                                                <span className="ml-1 capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">Service</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                                <div className="font-semibold">{selectedOrder.service?.title}</div>
                                                <div className="text-sm text-muted-foreground">{selectedOrder.service?.description}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Customer</Label>
                                                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                                    <div className="font-semibold">{selectedOrder.user?.name}</div>
                                                    <div className="text-sm text-muted-foreground">{selectedOrder.user?.phone}</div>
                                                    <div className="text-sm text-muted-foreground break-all">{selectedOrder.user?.email}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Provider</Label>
                                                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                                    <div className="font-semibold">{selectedOrder.provider?.name}</div>
                                                    <div className="text-sm text-muted-foreground">{selectedOrder.provider?.phone}</div>
                                                    <div className="text-sm text-muted-foreground break-all">{selectedOrder.provider?.email}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedOrder.location && (
                                            <div>
                                                <Label className="text-sm font-medium">Location</Label>
                                                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>{selectedOrder.location}</span>
                                                    </div>
                                                    {selectedOrder.locationDetails && (
                                                        <div className="text-sm text-muted-foreground mt-1">{selectedOrder.locationDetails}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Quantity</Label>
                                                <div className="mt-1 text-lg font-semibold">{selectedOrder.quantity}</div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Total Amount</Label>
                                                <div className="mt-1 text-lg font-semibold text-green-600">{renderCurrency(selectedOrder.totalAmount)}</div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Commission</Label>
                                                <div className="mt-1 text-lg font-semibold text-blue-600">{renderCurrency(selectedOrder.commissionAmount)}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Order Date</Label>
                                                <div className="mt-1 text-sm">{formatDate(selectedOrder.orderDate)}</div>
                                            </div>
                                            {selectedOrder.scheduledDate && (
                                                <div>
                                                    <Label className="text-sm font-medium">Scheduled Date</Label>
                                                    <div className="mt-1 text-sm">{formatDate(selectedOrder.scheduledDate)}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter className="flex-shrink-0 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Status Update Dialog */}
                    <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>Update Order Status</DialogTitle>
                                <DialogDescription>
                                    Change the status of order #{selectedOrder?.bookingId}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selectedOrder!.id, 'accepted')}
                                        disabled={updateStatusMutation.isPending}
                                        className="h-12"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Accept
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(selectedOrder!.id, 'in_progress')}
                                        disabled={updateStatusMutation.isPending}
                                        className="h-12"
                                    >
                                        <Truck className="h-4 w-4 mr-2" />
                                        Start
                                    </Button>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                                    Cancel
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Accept Order Dialog */}
                    <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Accept Order</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to accept order #{selectedOrder?.bookingId}? This will move the order to accepted status.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="acceptNotes" className="text-sm font-medium">Admin Notes (Optional)</Label>
                                    <Textarea
                                        id="acceptNotes"
                                        value={acceptNotes}
                                        onChange={(e) => setAcceptNotes(e.target.value)}
                                        placeholder="Enter any notes about accepting this order..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={() => handleOrderAccept(selectedOrder!.id)}
                                    disabled={acceptOrderMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Accept Order
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Reject Order Dialog */}
                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Reject Order</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to reject order #{selectedOrder?.bookingId}? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="rejectReason" className="text-sm font-medium">Rejection Reason (Required)</Label>
                                    <Textarea
                                        id="rejectReason"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Enter reason for rejecting this order..."
                                        rows={3}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                                    Keep Order
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleOrderReject(selectedOrder!.id)}
                                    disabled={rejectOrderMutation.isPending || !rejectReason.trim()}
                                >
                                    Reject Order
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Cancel Order Dialog */}
                    <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Cancel Order</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to cancel order #{selectedOrder?.bookingId}? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="cancelReason" className="text-sm font-medium">Cancellation Reason (Optional)</Label>
                                    <Textarea
                                        id="cancelReason"
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Enter reason for cancellation..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                                    Keep Order
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleOrderCancel(selectedOrder!.id)}
                                    disabled={cancelOrderMutation.isPending}
                                >
                                    Cancel Order
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    )
} 