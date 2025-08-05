"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
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
import { useProviders, useProviderServices, useProviderOrders, useProviderRatings } from "@/lib/api/hooks/useProviders"
import { useProviderStats, useAdminActivateProvider, useAdminDeactivateProvider, useAdminVerifyProvider, useAdminUnverifyProvider } from "@/lib/api/hooks/useAdmin"
import { Provider, ProviderVerification, ProviderJoinRequest } from "@/lib/api/types"
import { formatCurrency } from "@/lib/utils"
import { DocumentManagementDialog } from "@/components/documents/document-management-dialog"
import {
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Eye,
    Filter,
    MapPin,
    Package,
    Phone,
    RefreshCw,
    Search,
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
    FileText
} from "lucide-react"
import { useMemo, useState } from "react"
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

const getStatusColor = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800 border-red-200'
    if (!isVerified) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
}

const getStatusIcon = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return <UserX className="h-4 w-4" />
    if (!isVerified) return <Clock className="h-4 w-4" />
    return <UserCheck className="h-4 w-4" />
}

const getStatusText = (isActive: boolean, isVerified: boolean) => {
    if (!isActive) return 'Inactive'
    if (!isVerified) return 'Unverified'
    return 'Active'
}

export default function ProvidersManagementPage() {
    const [activeTab, setActiveTab] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("list")
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
    const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false)
    const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false)
    const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false)
    const [verificationNotes, setVerificationNotes] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [verificationFilter, setVerificationFilter] = useState<string>("all")

    // Hooks
    const { data: providersResponse, isLoading: providersLoading, refetch: refetchProviders } = useProviders(1, 1000)
    const { data: providerStats } = useProviderStats()
    const { data: providerServices } = useProviderServices(selectedProvider?.id || 0)
    const { data: providerOrders } = useProviderOrders(selectedProvider?.id || 0)
    const { data: providerRatings } = useProviderRatings(selectedProvider?.id || 0)

    // Extract data from response
    const providers = (Array.isArray(providersResponse) ? providersResponse : providersResponse?.data) as Provider[] || []

    // Filter providers by status and verification
    const activeProviders = providers.filter(provider => provider.isActive)
    const inactiveProviders = providers.filter(provider => !provider.isActive)
    const verifiedProviders = providers.filter(provider => provider.isVerified)
    const unverifiedProviders = providers.filter(provider => !provider.isVerified)

    // Filter providers based on active tab and search
    const getFilteredProviders = (providerList: Provider[]) => {
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

        if (verificationFilter !== "all") {
            filtered = filtered.filter(provider =>
                verificationFilter === "verified" ? provider.isVerified : !provider.isVerified
            )
        }

        return filtered
    }

    const getCurrentProviders = () => {
        switch (activeTab) {
            case "active":
                return getFilteredProviders(activeProviders)
            case "inactive":
                return getFilteredProviders(inactiveProviders)
            case "verified":
                return getFilteredProviders(verifiedProviders)
            case "unverified":
                return getFilteredProviders(unverifiedProviders)
            default:
                return getFilteredProviders(providers)
        }
    }

    const currentProviders = getCurrentProviders()

    // Admin provider management hooks
    const activateProviderMutation = useAdminActivateProvider()
    const deactivateProviderMutation = useAdminDeactivateProvider()
    const verifyProviderMutation = useAdminVerifyProvider()
    const unverifyProviderMutation = useAdminUnverifyProvider()

    const handleActivateProvider = async (providerId: number) => {
        try {
            await activateProviderMutation.mutateAsync(providerId)
            toast.success("Provider activated successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to activate provider")
        }
    }

    const handleDeactivateProvider = async (providerId: number) => {
        try {
            await deactivateProviderMutation.mutateAsync(providerId)
            toast.success("Provider deactivated successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to deactivate provider")
        }
    }

    const handleVerifyProvider = async (providerId: number) => {
        try {
            await verifyProviderMutation.mutateAsync(providerId)
            toast.success("Provider verified successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to verify provider")
        }
    }

    const handleUnverifyProvider = async (providerId: number) => {
        try {
            await unverifyProviderMutation.mutateAsync(providerId)
            toast.success("Provider unverified successfully")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to unverify provider")
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

    const calculateAverageRating = (ratings: any[]) => {
        if (!ratings || ratings.length === 0) return 0
        const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
        return (sum / ratings.length).toFixed(1)
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="space-y-8">
                    {/* Enhanced Stats Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <StatCard
                            title="Total Providers"
                            value={providers.length}
                            icon={Users}
                            color="bg-gradient-to-br from-blue-500 to-indigo-600"
                            description="All providers"
                        />
                        <StatCard
                            title="Active"
                            value={activeProviders.length}
                            icon={UserCheck}
                            color="bg-gradient-to-br from-green-500 to-emerald-600"
                            description="Currently active"
                        />
                        <StatCard
                            title="Inactive"
                            value={inactiveProviders.length}
                            icon={UserX}
                            color="bg-gradient-to-br from-red-500 to-pink-600"
                            description="Deactivated"
                        />
                        <StatCard
                            title="Verified"
                            value={verifiedProviders.length}
                            icon={ShieldCheck}
                            color="bg-gradient-to-br from-emerald-500 to-teal-600"
                            description="Document verified"
                        />
                        <StatCard
                            title="Unverified"
                            value={unverifiedProviders.length}
                            icon={ShieldX}
                            color="bg-gradient-to-br from-yellow-500 to-orange-600"
                            description="Pending verification"
                        />
                        <StatCard
                            title="New This Month"
                            value={providers.filter(p => {
                                const createdAt = new Date(p.createdAt)
                                const monthAgo = new Date()
                                monthAgo.setMonth(monthAgo.getMonth() - 1)
                                return createdAt >= monthAgo
                            }).length}
                            icon={Zap}
                            color="bg-gradient-to-br from-purple-500 to-violet-600"
                            description="Recent registrations"
                        />
                    </div>

                    {/* Enhanced Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <TabsList className="grid w-auto grid-cols-5 bg-gray-100 p-1">
                                <TabsTrigger
                                    value="all"
                                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    All Providers
                                </TabsTrigger>
                                <TabsTrigger
                                    value="active"
                                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Active
                                </TabsTrigger>
                                <TabsTrigger
                                    value="inactive"
                                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Inactive
                                </TabsTrigger>
                                <TabsTrigger
                                    value="verified"
                                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Verified
                                </TabsTrigger>
                                <TabsTrigger
                                    value="unverified"
                                    className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Unverified
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
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Verification Filter */}
                                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by verification" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Verification</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="unverified">Unverified</SelectItem>
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

                        {/* Providers Display */}
                        <TabsContent value={activeTab} className="space-y-6">
                            {providersLoading ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <ProviderCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : viewMode === "grid" ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {currentProviders.map((provider) => (
                                        <Card key={provider.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 hover:from-blue-50/50 hover:to-indigo-50/50">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Badge variant="outline" className={`${getStatusColor(provider.isActive, provider.isVerified)}`}>
                                                                {getStatusIcon(provider.isActive, provider.isVerified)}
                                                                <span className="ml-1">{getStatusText(provider.isActive, provider.isVerified)}</span>
                                                            </Badge>
                                                            {provider.isVerified && (
                                                                <Shield className="h-4 w-4 text-green-600" />
                                                            )}
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
                                                    {provider.email && (
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground truncate">{provider.email}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">{provider.state}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Joined {formatDate(provider.createdAt)}</span>
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
                                                                        Are you sure you want to activate {provider.name}? This will allow them to access the platform and receive orders.
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
                                                                        Are you sure you want to deactivate {provider.name}? This will prevent them from accessing the platform and receiving new orders.
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
                                                    {!provider.isVerified ? (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 hover:bg-green-100"
                                                                >
                                                                    <ShieldCheck className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Verify Provider</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to verify {provider.name}? This will mark their documents as verified and increase their trust level.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleVerifyProvider(provider.id)}
                                                                        className="bg-green-600 hover:bg-green-700"
                                                                    >
                                                                        Verify
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
                                                                    className="h-8 w-8 p-0 hover:bg-yellow-100"
                                                                >
                                                                    <ShieldX className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Remove Verification</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to remove verification from {provider.name}? This will mark their documents as unverified and may affect their trust level.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleUnverifyProvider(provider.id)}
                                                                        className="bg-yellow-600 hover:bg-yellow-700"
                                                                    >
                                                                        Remove Verification
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
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
                                                <TableHead className="font-semibold">Provider Name</TableHead>
                                                <TableHead className="font-semibold">Contact Info</TableHead>
                                                <TableHead className="font-semibold">Location</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                                <TableHead className="font-semibold">Verification</TableHead>
                                                <TableHead className="font-semibold">Joined</TableHead>
                                                <TableHead className="font-semibold text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentProviders.map((provider) => (
                                                <TableRow key={provider.id} className="hover:bg-gray-50/50">
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium text-gray-900">{provider.name}</div>
                                                            <div className="text-sm text-muted-foreground">{provider.description}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium">{provider.phone}</div>
                                                            {provider.email && (
                                                                <div className="text-sm text-muted-foreground">{provider.email}</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{provider.state}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={`${getStatusColor(provider.isActive, provider.isVerified)}`}>
                                                            {getStatusIcon(provider.isActive, provider.isVerified)}
                                                            <span className="ml-1">{getStatusText(provider.isActive, provider.isVerified)}</span>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            {provider.isVerified ? (
                                                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <ShieldX className="h-4 w-4 text-yellow-600" />
                                                            )}
                                                            <span className="text-sm">
                                                                {provider.isVerified ? 'Verified' : 'Unverified'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{formatDate(provider.createdAt)}</div>
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
                                                                                Are you sure you want to activate {provider.name}? This will allow them to access the platform and receive orders.
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
                                                                                Are you sure you want to deactivate {provider.name}? This will prevent them from accessing the platform and receiving new orders.
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
                                                            {!provider.isVerified ? (
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 hover:bg-green-100"
                                                                        >
                                                                            <ShieldCheck className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Verify Provider</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to verify {provider.name}? This will mark their documents as verified and increase their trust level.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleVerifyProvider(provider.id)}
                                                                                className="bg-green-600 hover:bg-green-700"
                                                                            >
                                                                                Verify
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
                                                                            className="h-8 w-8 p-0 hover:bg-yellow-100"
                                                                        >
                                                                            <ShieldX className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Remove Verification</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to remove verification from {provider.name}? This will mark their documents as unverified and may affect their trust level.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleUnverifyProvider(provider.id)}
                                                                                className="bg-yellow-600 hover:bg-yellow-700"
                                                                            >
                                                                                Remove Verification
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            )}

                            {currentProviders.length === 0 && !providersLoading && (
                                <Card className="border-0 shadow-lg">
                                    <CardContent className="p-12 text-center">
                                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No providers found</h3>
                                        <p className="text-muted-foreground">
                                            {searchTerm ? `No providers match your search "${searchTerm}"` : `No providers in ${activeTab} status`}
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
                                            <Badge variant="outline" className={`${getStatusColor(selectedProvider.isActive, selectedProvider.isVerified)}`}>
                                                {getStatusIcon(selectedProvider.isActive, selectedProvider.isVerified)}
                                                <span className="ml-1">{getStatusText(selectedProvider.isActive, selectedProvider.isVerified)}</span>
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

                                        {providerServices && providerServices.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-medium">Services Offered</Label>
                                                <div className="mt-1 space-y-2">
                                                    {providerServices.map((service: any, index: number) => (
                                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                            <div className="font-semibold">{service.service?.title}</div>
                                                            <div className="text-sm text-muted-foreground">{service.service?.description}</div>
                                                            <div className="text-sm font-medium text-green-600 mt-1">
                                                                Price: {formatCurrency(service.price)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {providerOrders && providerOrders.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-medium">Recent Orders</Label>
                                                <div className="mt-1 space-y-2">
                                                    {providerOrders.slice(0, 5).map((order: any, index: number) => (
                                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-semibold">#{order.bookingId}</div>
                                                                    <div className="text-sm text-muted-foreground">{order.service?.title}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-semibold text-green-600">{formatCurrency(order.totalAmount)}</div>
                                                                    <div className="text-sm text-muted-foreground">{order.status}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {providerRatings && providerRatings.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-medium">Customer Ratings</Label>
                                                <div className="mt-1 space-y-2">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                        <span className="font-semibold">{calculateAverageRating(providerRatings)}</span>
                                                        <span className="text-sm text-muted-foreground">({providerRatings.length} reviews)</span>
                                                    </div>
                                                    {providerRatings.slice(0, 3).map((rating: any, index: number) => (
                                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center space-x-1">
                                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={`h-3 w-3 ${i < rating.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm text-muted-foreground">{rating.user?.name}</span>
                                                            </div>
                                                            {rating.comment && (
                                                                <div className="text-sm text-muted-foreground">{rating.comment}</div>
                                                            )}
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

                    {/* Verification Dialog */}
                    <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Provider Verification</DialogTitle>
                                <DialogDescription>
                                    Review and manage provider verification for {selectedProvider?.name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="verificationNotes" className="text-sm font-medium">Admin Notes (Optional)</Label>
                                    <Textarea
                                        id="verificationNotes"
                                        value={verificationNotes}
                                        onChange={(e) => setVerificationNotes(e.target.value)}
                                        placeholder="Enter verification notes..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsVerificationDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (selectedProvider) {
                                            handleVerifyProvider(selectedProvider.id)
                                            setIsVerificationDialogOpen(false)
                                            setVerificationNotes("")
                                        }
                                    }}
                                >
                                    Approve Verification
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