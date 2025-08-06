"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAdminActivateProvider, useAdminDeactivateProvider, useAdminVerifyProvider, useAdminUnverifyProvider, useAdminPendingJoinRequests, useAdminApproveJoinRequest, useAdminRejectJoinRequest, useAdminProviders, useAdminUnverifiedProviders } from "@/lib/api/hooks/useAdmin"
import { AdminProvider, AdminProviderJoinRequest } from "@/lib/types/admin"
import { formatCurrency } from "@/lib/utils"
import { DocumentManagementDialog } from "@/components/documents/document-management-dialog"
import {
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    Filter,
    MapPin,
    Package,
    Phone,
    Shield,
    Star,
    Truck,
    User,
    XCircle,
    Zap,
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    ShieldX,
    Calendar,
    FileText,
    TrendingUp,
    TrendingDown,
    Percent,
    Receipt
} from "lucide-react"
import { useState, useMemo } from "react"
import toast from "react-hot-toast"

// Loading Skeleton Components
const ProviderCardSkeleton = () => (
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
    icon: React.ComponentType<{ className?: string }>
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

const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
}

const getStatusIcon = (isActive: boolean) => {
    return isActive ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />
}

const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive'
}

export default function ProviderVerificationPage() {
    const [activeTab, setActiveTab] = useState("verified")
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("list")
    const [selectedProvider, setSelectedProvider] = useState<AdminProvider | null>(null)
    const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false)
    const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false)
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [approveNotes, setApproveNotes] = useState("")
    const [rejectReason, setRejectReason] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    // Hooks for verified providers
    const { data: verifiedProviders, isLoading: verifiedProvidersLoading } = useAdminProviders()
    const { data: unverifiedProviders, isLoading: unverifiedProvidersLoading } = useAdminUnverifiedProviders()

    // Hooks for join requests
    const { data: joinRequestsResponse, isLoading: joinRequestsLoading } = useAdminPendingJoinRequests()

    // Extract data from responses
    const joinRequests = (Array.isArray(joinRequestsResponse) ? joinRequestsResponse : joinRequestsResponse?.data) as AdminProviderJoinRequest[] || []

    // Admin provider management hooks
    const activateProviderMutation = useAdminActivateProvider()
    const deactivateProviderMutation = useAdminDeactivateProvider()
    const verifyProviderMutation = useAdminVerifyProvider()
    const unverifyProviderMutation = useAdminUnverifyProvider()
    const approveJoinRequestMutation = useAdminApproveJoinRequest()
    const rejectJoinRequestMutation = useAdminRejectJoinRequest()

    // Computed statistics for verified providers
    const providerStats = useMemo(() => {
        if (!verifiedProviders) {
            return {
                total: 0,
                active: 0,
                inactive: 0,
                totalIncome: 0,
                pendingRequests: joinRequests?.length || 0
            }
        }

        const totalIncome = verifiedProviders.reduce((sum, provider) => {
            // Calculate from actual order data
            const providerIncome = provider.orders?.reduce((orderSum, order) => orderSum + order.totalAmount, 0) || 0
            return sum + providerIncome
        }, 0)

        return {
            total: verifiedProviders.length,
            active: verifiedProviders.filter(p => p.isActive).length,
            inactive: verifiedProviders.filter(p => !p.isActive).length,
            totalIncome: Math.round(totalIncome * 100) / 100,
            pendingRequests: joinRequests?.length || 0
        }
    }, [verifiedProviders, joinRequests])

    // Filter providers based on search and status
    const getFilteredProviders = (providerList: AdminProvider[]) => {
        let filtered = providerList.filter(provider =>
            provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            provider.state.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (statusFilter !== "all") {
            filtered = filtered.filter(provider =>
                statusFilter === "active" ? provider.isActive : !provider.isActive
            )
        }

        return filtered
    }

    const currentProviders = getFilteredProviders(verifiedProviders || [])

    // Calculate provider income from actual data
    const calculateProviderIncome = (providerId: number) => {
        const provider = verifiedProviders?.find(p => p.id === providerId)
        if (!provider) {
            return {
                total: 0,
                afterDiscounts: 0,
                offerDiscounts: 0
            }
        }

        const totalIncome = provider.orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0
        const offerDiscounts = provider.offers?.reduce((sum, offer) => sum + (offer.originalPrice - offer.offerPrice), 0) || 0
        const afterDiscounts = totalIncome - offerDiscounts

        return {
            total: totalIncome,
            afterDiscounts: afterDiscounts,
            offerDiscounts: offerDiscounts
        }
    }

    const handleActivateProvider = async (providerId: number) => {
        try {
            await activateProviderMutation.mutateAsync(providerId)
            toast.success("Provider activated successfully")
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to activate provider"
            toast.error(errorMessage)
        }
    }

    const handleDeactivateProvider = async (providerId: number) => {
        try {
            await deactivateProviderMutation.mutateAsync(providerId)
            toast.success("Provider deactivated successfully")
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to deactivate provider"
            toast.error(errorMessage)
        }
    }

    const handleApproveJoinRequest = async (requestId: number) => {
        try {
            await approveJoinRequestMutation.mutateAsync({ id: requestId, notes: approveNotes })
            toast.success("Join request approved successfully")
            setIsApproveDialogOpen(false)
            setApproveNotes("")
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to approve join request"
            toast.error(errorMessage)
        }
    }

    const handleRejectJoinRequest = async (requestId: number) => {
        try {
            await rejectJoinRequestMutation.mutateAsync({ id: requestId, notes: rejectReason })
            toast.success("Join request rejected successfully")
            setIsRejectDialogOpen(false)
            setRejectReason("")
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to reject join request"
            toast.error(errorMessage)
        }
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

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="space-y-8">
                    {/* Enhanced Stats Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <StatCard
                            title="Verified Providers"
                            value={providerStats.total}
                            icon={ShieldCheck}
                            color="bg-gradient-to-br from-green-500 to-emerald-600"
                            description="Document verified"
                        />
                        <StatCard
                            title="Active Providers"
                            value={providerStats.active}
                            icon={UserCheck}
                            color="bg-gradient-to-br from-blue-500 to-indigo-600"
                            description="Currently active"
                        />
                        <StatCard
                            title="Inactive Providers"
                            value={providerStats.inactive}
                            icon={UserX}
                            color="bg-gradient-to-br from-red-500 to-pink-600"
                            description="Deactivated"
                        />
                        <StatCard
                            title="Total Income"
                            value={`${providerStats.totalIncome} OMR`}
                            icon={DollarSign}
                            color="bg-gradient-to-br from-emerald-500 to-teal-600"
                            description="All time earnings"
                        />
                        <StatCard
                            title="Pending Requests"
                            value={providerStats.pendingRequests}
                            icon={Clock}
                            color="bg-gradient-to-br from-yellow-500 to-orange-600"
                            description="Awaiting approval"
                        />
                    </div>

                    {/* Main Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <TabsList className="grid w-auto grid-cols-2 bg-gray-100 p-1">
                                <TabsTrigger
                                    value="verified"
                                    className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Verified Providers
                                </TabsTrigger>
                                <TabsTrigger
                                    value="join-requests"
                                    className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Provider Join Requests
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center space-x-3">
                                {/* Status Filter - only for verified providers */}
                                {activeTab === "verified" && (
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}

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

                        {/* Verified Providers Tab */}
                        <TabsContent value="verified" className="space-y-6">
                            {verifiedProvidersLoading ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <ProviderCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : viewMode === "grid" ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {currentProviders.map((provider) => {
                                        const income = calculateProviderIncome(provider.id)
                                        return (
                                            <Card key={provider.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 hover:from-blue-50/50 hover:to-indigo-50/50">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <Badge variant="outline" className={`${getStatusColor(provider.isActive)}`}>
                                                                    {getStatusIcon(provider.isActive)}
                                                                    <span className="ml-1">{getStatusText(provider.isActive)}</span>
                                                                </Badge>
                                                                <Shield className="h-4 w-4 text-green-600" />
                                                            </div>
                                                            <h3 className="font-semibold text-gray-900 mb-1">{provider.name}</h3>
                                                            <p className="text-sm text-muted-foreground mb-3">{provider.description}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground">{provider.phone}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground">{provider.state}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground">Total: {renderCurrency(income.total)}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <Percent className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground">Discounts: {renderCurrency(income.offerDiscounts)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedProvider(provider)
                                                                setIsProviderDialogOpen(true)
                                                            }}
                                                            className="h-8 w-8 p-0 hover:bg-blue-100"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedProvider(provider)
                                                                setIsDocumentDialogOpen(true)
                                                            }}
                                                            className="h-8 w-8 p-0 hover:bg-purple-100"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                        {!provider.isActive ? (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 hover:bg-green-100"
                                                                    >
                                                                        <UserCheck className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Activate Provider</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to activate {provider.name}?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleActivateProvider(provider.id)}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            Activate
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        ) : (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 hover:bg-red-100"
                                                                    >
                                                                        <UserX className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Deactivate Provider</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to deactivate {provider.name}?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeactivateProvider(provider.id)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            Deactivate
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            ) : (
                                <Card className="border-0 shadow-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="font-semibold">Provider</TableHead>
                                                <TableHead className="font-semibold">Contact & Location</TableHead>
                                                <TableHead className="font-semibold">Categories & Services</TableHead>
                                                <TableHead className="font-semibold">Incoming Orders</TableHead>
                                                <TableHead className="font-semibold">Detailed Income</TableHead>
                                                <TableHead className="font-semibold">Documents</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                                <TableHead className="font-semibold text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentProviders.map((provider) => {
                                                const income = calculateProviderIncome(provider.id)
                                                return (
                                                    <TableRow key={provider.id} className="hover:bg-gray-50/50">
                                                        <TableCell>
                                                            <div className="flex items-center space-x-3">
                                                                <Avatar className="h-10 w-10">
                                                                    <AvatarImage src={provider.image} alt={provider.name} />
                                                                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="space-y-1">
                                                                    <div className="font-medium text-gray-900">{provider.name}</div>
                                                                    <div className="text-sm text-muted-foreground">{provider.description}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="text-sm font-medium">{provider.phone}</div>
                                                                <div className="text-sm text-muted-foreground">{provider.state}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="text-sm">Categories: N/A</div>
                                                                <div className="text-sm text-muted-foreground">Services: N/A</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm font-medium">0 orders</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="text-sm font-medium text-green-600">Total: {renderCurrency(income.total)}</div>
                                                                <div className="text-sm text-muted-foreground">After discounts: {renderCurrency(income.afterDiscounts)}</div>
                                                                <div className="text-xs text-muted-foreground">Offer discounts: {renderCurrency(income.offerDiscounts)}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedProvider(provider)
                                                                    setIsDocumentDialogOpen(true)
                                                                }}
                                                                className="h-8 w-8 p-0 hover:bg-purple-100"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={`${getStatusColor(provider.isActive)}`}>
                                                                {getStatusIcon(provider.isActive)}
                                                                <span className="ml-1">{getStatusText(provider.isActive)}</span>
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedProvider(provider)
                                                                        setIsProviderDialogOpen(true)
                                                                    }}
                                                                    className="h-8 w-8 p-0 hover:bg-blue-100"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                {!provider.isActive ? (
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0 hover:bg-green-100"
                                                                            >
                                                                                <UserCheck className="h-4 w-4" />
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Activate Provider</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Are you sure you want to activate {provider.name}?
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() => handleActivateProvider(provider.id)}
                                                                                    className="bg-green-600 hover:bg-green-700"
                                                                                >
                                                                                    Activate
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                ) : (
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-8 w-8 p-0 hover:bg-red-100"
                                                                            >
                                                                                <UserX className="h-4 w-4" />
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Deactivate Provider</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Are you sure you want to deactivate {provider.name}?
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() => handleDeactivateProvider(provider.id)}
                                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                                >
                                                                                    Deactivate
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </Card>
                            )}

                            {currentProviders.length === 0 && !verifiedProvidersLoading && (
                                <Card className="border-0 shadow-lg">
                                    <CardContent className="p-12 text-center">
                                        <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No verified providers found</h3>
                                        <p className="text-muted-foreground">
                                            {searchTerm ? `No providers match your search "${searchTerm}"` : "No verified providers available"}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Provider Join Requests Tab */}
                        <TabsContent value="join-requests" className="space-y-6">
                            {joinRequestsLoading ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <ProviderCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : (
                                <Card className="border-0 shadow-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className="font-semibold">Provider</TableHead>
                                                <TableHead className="font-semibold">Contact Info</TableHead>
                                                <TableHead className="font-semibold">Categories & Services</TableHead>
                                                <TableHead className="font-semibold">Request Date</TableHead>
                                                <TableHead className="font-semibold text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {joinRequests.map((request) => (
                                                <TableRow key={request.id} className="hover:bg-gray-50/50">
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={request.provider?.image} alt={request.provider?.name} />
                                                                <AvatarFallback>{request.provider?.name?.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="space-y-1">
                                                                <div className="font-medium text-gray-900">{request.provider?.name}</div>
                                                                <div className="text-sm text-muted-foreground">{request.provider?.description}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium">{request.provider?.phone}</div>
                                                            {request.provider?.email && (
                                                                <div className="text-sm text-muted-foreground">{request.provider.email}</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="text-sm">Categories: N/A</div>
                                                            <div className="text-sm text-muted-foreground">Services: N/A</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{formatDate(request.requestDate)}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 hover:bg-green-100"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Approve Join Request</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to approve {request.provider?.name}'s join request?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleApproveJoinRequest(request.id)}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            Approve
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 hover:bg-red-100"
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Reject Join Request</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to reject {request.provider?.name}'s join request?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleRejectJoinRequest(request.id)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            Reject
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            )}

                            {joinRequests.length === 0 && !joinRequestsLoading && (
                                <Card className="border-0 shadow-lg">
                                    <CardContent className="p-12 text-center">
                                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending join requests</h3>
                                        <p className="text-muted-foreground">
                                            All provider join requests have been processed
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Provider Details Dialog */}
                    <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
                        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] max-h-[90vh] w-full overflow-hidden">
                            <DialogHeader className="flex-shrink-0">
                                <DialogTitle className="text-xl">Provider Details</DialogTitle>
                                <DialogDescription>
                                    Complete information about this provider
                                </DialogDescription>
                            </DialogHeader>
                            {selectedProvider && (
                                <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] pr-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Provider ID</Label>
                                            <div className="text-sm font-mono bg-gray-100 p-2 rounded">#{selectedProvider.id}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Status</Label>
                                            <Badge variant="outline" className={`${getStatusColor(selectedProvider.isActive)}`}>
                                                {getStatusIcon(selectedProvider.isActive)}
                                                <span className="ml-1">{getStatusText(selectedProvider.isActive)}</span>
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">Provider Information</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                                <div className="font-semibold">{selectedProvider.name}</div>
                                                <div className="text-sm text-muted-foreground">{selectedProvider.description}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Contact Information</Label>
                                                <div className="mt-1 p-3 bg-gray-50 rounded-lg space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{selectedProvider.phone}</span>
                                                    </div>
                                                    {selectedProvider.email && (
                                                        <div className="flex items-center space-x-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm break-all">{selectedProvider.email}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{selectedProvider.state}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Account Details</Label>
                                                <div className="mt-1 p-3 bg-gray-50 rounded-lg space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Active:</span>
                                                        <Badge variant={selectedProvider.isActive ? "default" : "secondary"}>
                                                            {selectedProvider.isActive ? "Yes" : "No"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Verified:</span>
                                                        <Badge variant={selectedProvider.isVerified ? "default" : "secondary"}>
                                                            {selectedProvider.isVerified ? "Yes" : "No"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Joined:</span>
                                                        <span className="text-sm">{formatDate(selectedProvider.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedProvider?.providerServices && selectedProvider.providerServices.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-medium">Services Offered</Label>
                                                <div className="mt-1 space-y-2">
                                                    {selectedProvider.providerServices.map((service, index: number) => (
                                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                            <div className="font-semibold">{service.service?.title}</div>
                                                            <div className="text-sm text-muted-foreground">{service.service?.description}</div>
                                                            <div className="text-sm font-medium text-green-600 mt-1">
                                                                Price: {formatCurrency(service.price)}
                                                            </div>
                                                            {service.service?.category && (
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    Category: {service.service.category.titleEn}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedProvider?.orders && selectedProvider.orders.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-medium">Recent Orders</Label>
                                                <div className="mt-1 space-y-2">
                                                    {selectedProvider.orders.slice(0, 5).map((order, index: number) => (
                                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-semibold">Order #{order.id}</div>
                                                                    <div className="text-sm text-muted-foreground">Total: {formatCurrency(order.totalAmount)}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-semibold text-green-600">{formatCurrency(order.providerAmount)}</div>
                                                                    <div className="text-sm text-muted-foreground">Commission: {formatCurrency(order.commissionAmount)}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <DialogFooter className="flex-shrink-0 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsProviderDialogOpen(false)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Approve Join Request Dialog */}
                    <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Approve Join Request</DialogTitle>
                                <DialogDescription>
                                    Add any notes about approving this join request (optional)
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="approveNotes" className="text-sm font-medium">Admin Notes (Optional)</Label>
                                    <Textarea
                                        id="approveNotes"
                                        value={approveNotes}
                                        onChange={(e) => setApproveNotes(e.target.value)}
                                        placeholder="Enter any notes about approving this request..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => setIsApproveDialogOpen(false)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Approve Request
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Reject Join Request Dialog */}
                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Reject Join Request</DialogTitle>
                                <DialogDescription>
                                    Please provide a reason for rejecting this join request
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="rejectReason" className="text-sm font-medium">Rejection Reason (Required)</Label>
                                    <Textarea
                                        id="rejectReason"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Enter reason for rejecting this request..."
                                        rows={3}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => setIsRejectDialogOpen(false)}
                                    disabled={!rejectReason.trim()}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Reject Request
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Document Management Dialog */}
                    <DocumentManagementDialog
                        provider={selectedProvider}
                        isOpen={isDocumentDialogOpen}
                        onClose={() => setIsDocumentDialogOpen(false)}
                    />
                </div>
            </AdminLayout>
        </ProtectedRoute>
    )
}