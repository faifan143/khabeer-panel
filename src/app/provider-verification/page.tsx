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
import { useAdminActivateProvider, useAdminDeactivateProvider, useAdminPendingJoinRequests, useAdminApproveJoinRequest, useAdminRejectJoinRequest, useAdminProviders, useAdminUnverifiedProviders } from "@/lib/api/hooks/useAdmin"
import { AdminProvider, AdminProviderJoinRequest } from "@/lib/types/admin"
import { formatCurrency } from "@/lib/utils"
import { DocumentManagementDialog } from "@/components/documents/document-management-dialog"
import { SearchBox } from "@/components/ui/search-box"
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
    User,
    XCircle,
    Zap,
    UserCheck,
    UserX,
    ShieldCheck,
    FileText,
    Percent
} from "lucide-react"
import { useState, useMemo } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/lib/hooks/useLanguage"

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

export default function ProviderVerificationPage() {
    const { t } = useTranslation()
    const { isRTL } = useLanguage()

    const getStatusText = (isActive: boolean) => {
        return isActive ? t('providers.active') : t('providers.inactive')
    }

    const [activeTab, setActiveTab] = useState("verified")
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("list")
    const [selectedProvider, setSelectedProvider] = useState<AdminProvider | null>(null)
    const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false)
    const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false)
    const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
    const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false)
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [approveNotes, setApproveNotes] = useState("")
    const [rejectReason, setRejectReason] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    // Hooks for verified providers
    const { data: verifiedProviders, isLoading: verifiedProvidersLoading } = useAdminProviders()
    const { data: unverifiedProviders } = useAdminUnverifiedProviders()

    // Hooks for join requests
    const { data: joinRequestsResponse, isLoading: joinRequestsLoading, error: joinRequestsError } = useAdminPendingJoinRequests()

    // NOTE: The API endpoint /admin/join-requests/pending might be returning provider data instead of join request data
    // This is a workaround to handle the data structure mismatch
    // In the future, the API should be updated to return proper join request objects
    // Extract data from responses with debugging
    console.log('Raw joinRequestsResponse:', joinRequestsResponse)
    console.log('Join requests error:', joinRequestsError)
    console.log('Response type:', typeof joinRequestsResponse)
    console.log('Is array:', Array.isArray(joinRequestsResponse))
    if (joinRequestsResponse && typeof joinRequestsResponse === 'object') {
        console.log('Response keys:', Object.keys(joinRequestsResponse))
        if (Array.isArray(joinRequestsResponse) && joinRequestsResponse.length > 0) {
            console.log('First item type:', typeof joinRequestsResponse[0])
            console.log('First item keys:', Object.keys(joinRequestsResponse[0]))
        }
    }

    // Handle different response structures
    let joinRequests: AdminProviderJoinRequest[] = []

    if (joinRequestsResponse) {
        if (Array.isArray(joinRequestsResponse)) {
            // If it's an array, check if it contains providers or join requests
            if (joinRequestsResponse.length > 0) {
                const firstItem = joinRequestsResponse[0] as any
                if (firstItem.providerId && firstItem.requestDate) {
                    // It's already in the correct format
                    joinRequests = joinRequestsResponse
                } else if (firstItem.id && firstItem.name && firstItem.isVerified === false) {
                    // It's an array of unverified providers, convert to join requests
                    joinRequests = joinRequestsResponse.map(provider => ({
                        id: provider.id,
                        providerId: provider.id,
                        requestDate: provider.createdAt || new Date().toISOString(),
                        status: 'pending',
                        adminNotes: null,
                        provider: {
                            id: provider.id,
                            name: provider.name,
                            email: provider.email,
                            phone: provider.phone,
                            description: provider.description,
                            image: provider.image,
                            state: provider.state,
                            isActive: provider.isActive,
                            officialDocuments: provider.officialDocuments,
                            providerServices: provider.providerServices || [],
                            _count: {
                                providerServices: provider._count?.providerServices || 0
                            }
                        }
                    }))
                }
            }
        } else if (joinRequestsResponse.data && Array.isArray(joinRequestsResponse.data)) {
            // Handle nested data structure
            const data = joinRequestsResponse.data
            if (data.length > 0) {
                const firstItem = data[0] as any
                if (firstItem.providerId && firstItem.requestDate) {
                    joinRequests = data
                } else if (firstItem.id && firstItem.name && firstItem.isVerified === false) {
                    joinRequests = data.map(provider => ({
                        id: provider.id,
                        providerId: provider.id,
                        requestDate: provider.createdAt || new Date().toISOString(),
                        status: 'pending',
                        adminNotes: null,
                        provider: {
                            id: provider.id,
                            name: provider.name,
                            email: provider.email,
                            phone: provider.phone,
                            description: provider.description,
                            image: provider.image,
                            state: provider.state,
                            isActive: provider.isActive,
                            officialDocuments: provider.officialDocuments,
                            providerServices: provider.providerServices || [],
                            _count: {
                                providerServices: provider._count?.providerServices || 0
                            }
                        }
                    }))
                }
            }
        } else if (joinRequestsResponse.joinRequests && Array.isArray(joinRequestsResponse.joinRequests)) {
            joinRequests = joinRequestsResponse.joinRequests
        } else if (typeof joinRequestsResponse === 'object') {
            // If it's a single provider object with joinRequests array
            const provider = joinRequestsResponse as any
            if (provider.joinRequests && Array.isArray(provider.joinRequests)) {
                joinRequests = provider.joinRequests
            } else if (provider.id && provider.name && provider.isVerified === false) {
                // If it's a single unverified provider, create a join request object
                joinRequests = [{
                    id: provider.id,
                    providerId: provider.id,
                    requestDate: provider.createdAt || new Date().toISOString(),
                    status: 'pending',
                    adminNotes: null,
                    provider: {
                        id: provider.id,
                        name: provider.name,
                        email: provider.email,
                        phone: provider.phone,
                        description: provider.description,
                        image: provider.image,
                        state: provider.state,
                        isActive: provider.isActive,
                        officialDocuments: provider.officialDocuments,
                        providerServices: provider.providerServices || [],
                        _count: {
                            providerServices: provider._count?.providerServices || 0
                        }
                    }
                }]
            }
        }
    }

    // If no join requests found, try to create them from unverified providers
    if (joinRequests.length === 0 && unverifiedProviders && unverifiedProviders.length > 0) {
        console.log('No join requests found, creating from unverified providers:', unverifiedProviders)
        joinRequests = unverifiedProviders
            .filter(provider => !provider.isVerified) // Only include unverified providers
            .map(provider => ({
                id: provider.id,
                providerId: provider.id,
                requestDate: provider.createdAt || new Date().toISOString(),
                status: 'pending',
                adminNotes: null,
                provider: {
                    id: provider.id,
                    name: provider.name,
                    email: provider.email,
                    phone: provider.phone,
                    description: provider.description,
                    image: provider.image,
                    state: provider.state,
                    isActive: provider.isActive,
                    officialDocuments: provider.officialDocuments,
                    providerServices: provider.providerServices || [],
                    _count: {
                        providerServices: provider._count?.providerServices || 0
                    }
                }
            }))
        console.log('Created join requests from unverified providers:', joinRequests)
    }

    console.log('Processed joinRequests:', joinRequests)

    // Admin provider management hooks
    const activateProviderMutation = useAdminActivateProvider()
    const deactivateProviderMutation = useAdminDeactivateProvider()
    const approveJoinRequestMutation = useAdminApproveJoinRequest()
    const rejectJoinRequestMutation = useAdminRejectJoinRequest()

    // Computed statistics for verified providers
    const providerStats = useMemo(() => {
        if (!verifiedProviders || !verifiedProviders.providers || !Array.isArray(verifiedProviders.providers)) {
            return {
                total: 0,
                active: 0,
                inactive: 0,
                totalIncome: 0,
                pendingRequests: joinRequests?.length || 0
            }
        }

        const providers = verifiedProviders.providers
        const totalIncome = providers.reduce((sum, provider) => {
            // Calculate from actual order data
            const providerIncome = provider.orders?.reduce((orderSum, order) => orderSum + order.totalAmount, 0) || 0
            return sum + providerIncome
        }, 0)

        return {
            total: providers.length,
            active: providers.filter(p => p.isActive).length,
            inactive: providers.filter(p => !p.isActive).length,
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

    const currentProviders = getFilteredProviders(verifiedProviders?.providers || [])

    // Calculate provider income from actual data
    const calculateProviderIncome = (providerId: number) => {
        const provider = verifiedProviders?.providers?.find(p => p.id === providerId)
        if (!provider) {
            return {
                total: 0,
                afterDiscounts: 0,
                offerDiscounts: 0,
                totalCommission: 0,
                netIncome: 0
            }
        }

        const totalIncome = provider.orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0
        const totalCommission = provider.orders?.reduce((sum, order) => sum + order.commissionAmount, 0) || 0
        const providerAmount = provider.orders?.reduce((sum, order) => sum + order.providerAmount, 0) || 0

        // Calculate offer discounts from provider services and offers
        const offerDiscounts = provider.offers?.reduce((sum, offer) => sum + (offer.originalPrice - offer.offerPrice), 0) || 0

        const afterDiscounts = totalIncome - offerDiscounts
        const netIncome = totalIncome - totalCommission

        return {
            total: totalIncome,
            afterDiscounts: afterDiscounts,
            offerDiscounts: offerDiscounts,
            totalCommission: totalCommission,
            providerAmount: providerAmount,
            netIncome: netIncome
        }
    }

    const handleActivateProvider = async (providerId: number) => {
        try {
            await activateProviderMutation.mutateAsync(providerId)
            toast.success(t('providers.providerActivated'))
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('providers.failedToActivate')
            toast.error(errorMessage)
        }
    }

    const handleDeactivateProvider = async (providerId: number) => {
        try {
            await deactivateProviderMutation.mutateAsync(providerId)
            toast.success(t('providers.providerDeactivated'))
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('providers.failedToDeactivate')
            toast.error(errorMessage)
        }
    }

    const handleApproveJoinRequest = async (requestId: number) => {
        try {
            await approveJoinRequestMutation.mutateAsync({ id: requestId, notes: approveNotes })
            toast.success(t('providers.joinRequestApproved'))
            setIsApproveDialogOpen(false)
            setApproveNotes("")
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('providers.failedToApprove')
            toast.error(errorMessage)
        }
    }

    const handleRejectJoinRequest = async (requestId: number) => {
        try {
            await rejectJoinRequestMutation.mutateAsync({ id: requestId, notes: rejectReason })
            toast.success(t('providers.joinRequestRejected'))
            setIsRejectDialogOpen(false)
            setRejectReason("")
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('providers.failedToReject')
            toast.error(errorMessage)
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return t('providers.noDateProvided')

        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                console.warn('Invalid date string:', dateString)
                return t('providers.invalidDate')
            }

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            console.error('Error formatting date:', error, 'Date string:', dateString)
            return t('providers.invalidDate')
        }
    }

    const renderCurrency = (amount: number) => {
        const currencyString = formatCurrency(amount, 'ar') // Use Arabic locale for RTL
        const parts = currencyString.split(' ر.ع.')
        return (
            <span className="font-semibold">
                {parts[0]}
                <span className="text-sm text-muted-foreground ml-1 font-normal">ر.ع.</span>
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
                            title={t('providers.verifiedProviders')}
                            value={providerStats.total}
                            icon={ShieldCheck}
                            color="bg-gradient-to-br from-green-500 to-emerald-600"
                            description={t('providers.documentVerified')}
                        />
                        <StatCard
                            title={t('providers.activeProviders')}
                            value={providerStats.active}
                            icon={UserCheck}
                            color="bg-gradient-to-br from-blue-500 to-indigo-600"
                            description={t('providers.currentlyActive')}
                        />
                        <StatCard
                            title={t('providers.inactiveProviders')}
                            value={providerStats.inactive}
                            icon={UserX}
                            color="bg-gradient-to-br from-red-500 to-pink-600"
                            description={t('providers.deactivated')}
                        />
                        <StatCard
                            title={t('providers.totalIncome')}
                            value={`${providerStats.totalIncome} ر.ع.`}
                            icon={DollarSign}
                            color="bg-gradient-to-br from-emerald-500 to-teal-600"
                            description={t('providers.allTimeEarnings')}
                        />
                        <StatCard
                            title={t('providers.pendingRequests')}
                            value={providerStats.pendingRequests}
                            icon={Clock}
                            color="bg-gradient-to-br from-yellow-500 to-orange-600"
                            description={t('providers.awaitingApproval')}
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
                                    {t('providers.verifiedProviders')}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="join-requests"
                                    className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    {t('providers.providerJoinRequests')}
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center space-x-3">
                                {/* Search Box */}
                                <SearchBox
                                    placeholder={activeTab === "verified" ? t('providers.searchProviders') : t('providers.searchRequests')}
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    className="w-64"
                                />
                                {/* Status Filter - only for verified providers */}
                                {activeTab === "verified" && (
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder={t('providers.filterByStatus')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('providers.allStatus')}</SelectItem>
                                            <SelectItem value="active">{t('providers.active')}</SelectItem>
                                            <SelectItem value="inactive">{t('providers.inactive')}</SelectItem>
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
                                                            <p className="text-sm text-muted-foreground mb-3">
                                                                {provider.description || t('providers.professionalProvider')}
                                                            </p>
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
                                                            <span className="text-muted-foreground">{t('providers.total')}: {renderCurrency(income.total)}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm">
                                                            <Percent className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground">{t('providers.offerDiscounts')}: {renderCurrency(income.offerDiscounts)}</span>
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
                                                                        <AlertDialogTitle>{t('providers.activateProvider')}</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            {t('providers.activateProviderConfirm').replace('{name}', provider.name)}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>{t('providers.cancel')}</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleActivateProvider(provider.id)}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            {t('providers.activate')}
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
                                                                        <AlertDialogTitle>{t('providers.deactivateProvider')}</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            {t('providers.deactivateProviderConfirm').replace('{name}', provider.name)}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>{t('providers.cancel')}</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeactivateProvider(provider.id)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            {t('providers.deactivate')}
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
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.provider')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.contactLocation')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.categoriesServices')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.incomingOrders')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.detailedIncome')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.commissionFetched')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.documents')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.status')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-left' : 'text-right'}`}>{t('providers.tableHeaders.actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentProviders.map((provider) => {
                                                const income = calculateProviderIncome(provider.id)
                                                return (
                                                    <TableRow key={provider.id} className="hover:bg-gray-50/50">
                                                        <TableCell>
                                                            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                                                                <Avatar className="h-10 w-10">
                                                                    <AvatarImage src={process.env.NEXT_PUBLIC_API_URL_IMAGE + provider.image} alt={provider.name} />
                                                                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="space-y-1">
                                                                    <div className="font-medium text-gray-900">{provider.name}</div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {provider.description || t('providers.professionalProvider')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="text-sm font-medium">{provider.email}</div>
                                                                <div className="text-sm font-medium">{provider.phone}</div>
                                                                <div className="text-sm text-muted-foreground">{provider.state}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedProvider(provider)
                                                                        setIsServicesDialogOpen(true)
                                                                    }}
                                                                    className={`h-8 px-3 hover:bg-blue-100 ${isRTL ? 'text-right justify-end' : 'text-left justify-start'} cursor-pointer`}
                                                                >
                                                                    <Package className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                                    <span className="text-sm">
                                                                        {provider.providerServices.length > 0
                                                                            ? `${provider.providerServices.length} ${t('providers.services')}`
                                                                            : t('providers.noServices')
                                                                        }
                                                                    </span>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm font-medium">
                                                                {provider.orders?.length || 0} {t('providers.orders')}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedProvider(provider)
                                                                    setIsIncomeDialogOpen(true)
                                                                }}
                                                                className={`h-8 px-3 hover:bg-green-100 ${isRTL ? 'text-right justify-end' : 'text-left justify-start'} cursor-pointer`}
                                                            >
                                                                <DollarSign className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                                <span className="text-sm font-medium text-green-600">
                                                                    {renderCurrency(income.total)}
                                                                </span>
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Percent className="h-4 w-4 text-orange-600" />
                                                                <span className="text-sm font-semibold text-orange-700">
                                                                    {renderCurrency((provider as any).totalCommission || 0)}
                                                                </span>
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
                                                                <span className={isRTL ? 'mr-1' : 'ml-1'}>{getStatusText(provider.isActive)}</span>
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                                                            <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
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
                                                                                <AlertDialogTitle>{t('providers.activateProvider')}</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    {t('providers.activateProviderConfirm').replace('{name}', provider.name)}
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>{t('providers.cancel')}</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() => handleActivateProvider(provider.id)}
                                                                                    className="bg-green-600 hover:bg-green-700"
                                                                                >
                                                                                    {t('providers.activate')}
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
                                                                                <AlertDialogTitle>{t('providers.deactivateProvider')}</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    {t('providers.deactivateProviderConfirm').replace('{name}', provider.name)}
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>{t('providers.cancel')}</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() => handleDeactivateProvider(provider.id)}
                                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                                >
                                                                                    {t('providers.deactivate')}
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
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('providers.noVerifiedProvidersFound')}</h3>
                                        <p className="text-muted-foreground">
                                            {searchTerm ? t('providers.noProvidersMatchSearch').replace('{searchTerm}', searchTerm) : t('providers.noVerifiedProvidersAvailable')}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Provider Join Requests Tab */}
                        <TabsContent value="join-requests" className="space-y-6">
                            {/* Loading state */}
                            {joinRequestsLoading && (
                                <Card className="border-0 shadow-lg">
                                    <CardContent className="p-12 text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('providers.loadingJoinRequests')}</h3>
                                        <p className="text-muted-foreground">
                                            {t('providers.pleaseWaitFetching')}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Join Requests Table */}
                            {joinRequests.length > 0 && !joinRequestsLoading && (
                                <Card className="border-0 shadow-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50">
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.provider')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.contactInfo')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.state')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('providers.tableHeaders.requestDate')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-left' : 'text-right'}`}>{t('providers.tableHeaders.actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {joinRequests.map((request) => (
                                                <TableRow key={request.id} className="hover:bg-gray-50/50">
                                                    <TableCell>
                                                        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={process.env.NEXT_PUBLIC_API_URL_IMAGE + request.provider?.image} alt={request.provider?.name || t('providers.provider')} />
                                                                <AvatarFallback>
                                                                    {request.provider?.name?.charAt(0) || 'P'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="space-y-1">
                                                                <div className="font-medium text-gray-900">
                                                                    {request.provider?.name || t('providers.unknownProvider')}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {request.provider?.description || t('providers.noDescriptionAvailable')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium">
                                                                {request.provider?.phone || t('providers.noPhone')}
                                                            </div>
                                                            {request.provider?.email && (
                                                                <div className="text-sm text-muted-foreground">{request.provider.email}</div>
                                                            )}
                                                            {!request.provider?.email && (
                                                                <div className="text-sm text-muted-foreground">{t('providers.noEmail')}</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    {/* <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="text-sm">
                                                                Categories: {request.provider?.providerServices?.length > 0 ?
                                                                    request.provider.providerServices.map(ps => ps.service?.category?.titleEn).filter(Boolean).join(', ') :
                                                                    'N/A'}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                Services: {request.provider?.providerServices?.length > 0 ?
                                                                    request.provider.providerServices.map(ps => ps.service?.title).filter(Boolean).join(', ') :
                                                                    'N/A'}
                                                            </div>
                                                        </div>
                                                    </TableCell> */}
                                                    <TableCell>
                                                        <div className="text-sm text-muted-foreground">{request.provider.state}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{formatDate(request.requestDate)}</div>
                                                    </TableCell>
                                                    <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                                                        <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse space-x-2' : 'justify-end space-x-2'}`}>
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
                                                                        <AlertDialogTitle>{t('providers.approveJoinRequest')}</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            {t('providers.approveJoinRequestConfirm').replace('{name}', request.provider?.name || t('providers.thisProvider'))}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>{t('providers.cancel')}</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleApproveJoinRequest(request.id)}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            {t('providers.approve')}
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
                                                                        <AlertDialogTitle>{t('providers.rejectJoinRequest')}</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            {t('providers.rejectJoinRequestConfirm').replace('{name}', request.provider?.name || t('providers.thisProvider'))}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>{t('providers.cancel')}</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleRejectJoinRequest(request.id)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            {t('providers.reject')}
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
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('providers.noPendingJoinRequests')}</h3>
                                        <p className="text-muted-foreground">
                                            {t('providers.allJoinRequestsProcessed')}
                                        </p>
                                        {unverifiedProviders && unverifiedProviders.length > 0 && (
                                            <p className="text-sm text-blue-600 mt-2">
                                                {t('providers.foundUnverifiedProviders').replace('{count}', unverifiedProviders.length.toString())}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}



                            {/* Error handling */}
                            {joinRequestsError && (
                                <Card className="border-0 shadow-lg border-red-200 bg-red-50">
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-2 text-red-700">
                                            <XCircle className="h-5 w-5" />
                                            <div>
                                                <h4 className="font-medium">{t('providers.errorLoadingJoinRequests')}</h4>
                                                <p className="text-sm text-red-600">
                                                    {joinRequestsError instanceof Error ? joinRequestsError.message : t('providers.failedToLoadJoinRequests')}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Provider Details Dialog */}
                    <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
                        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] max-h-[90vh] w-full overflow-hidden">
                            <DialogHeader className="flex-shrink-0">
                                <DialogTitle className="text-xl">{t('providers.providerDetails')}</DialogTitle>
                                <DialogDescription>
                                    {t('providers.completeInformation')}
                                </DialogDescription>
                            </DialogHeader>
                            {selectedProvider && (
                                <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] pr-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">{t('providers.providerId')}</Label>
                                            <div className="text-sm font-mono bg-gray-100 p-2 rounded">#{selectedProvider.id}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">{t('providers.status')}</Label>
                                            <Badge variant="outline" className={`${getStatusColor(selectedProvider.isActive)}`}>
                                                {getStatusIcon(selectedProvider.isActive)}
                                                <span className="ml-1">{getStatusText(selectedProvider.isActive)}</span>
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">{t('providers.providerInformation')}</Label>
                                            <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                                                <div className="font-semibold">{selectedProvider.name}</div>
                                                <div className="text-sm text-muted-foreground">{selectedProvider.description}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">{t('providers.contactInformation')}</Label>
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
                                                <Label className="text-sm font-medium">{t('providers.accountDetails')}</Label>
                                                <div className="mt-1 p-3 bg-gray-50 rounded-lg space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">{t('providers.accountLabels.active')}</span>
                                                        <Badge variant={selectedProvider.isActive ? "default" : "secondary"}>
                                                            {selectedProvider.isActive ? t('providers.yes') : t('providers.no')}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">{t('providers.accountLabels.verified')}</span>
                                                        <Badge variant={selectedProvider.isVerified ? "default" : "secondary"}>
                                                            {selectedProvider.isVerified ? t('providers.yes') : t('providers.no')}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">{t('providers.accountLabels.joined')}</span>
                                                        <span className="text-sm">{formatDate(selectedProvider.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedProvider?.providerServices && selectedProvider.providerServices.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-medium">{t('providers.servicesOffered')}</Label>
                                                <div className="mt-1 space-y-2">
                                                    {selectedProvider.providerServices.map((service, index: number) => (
                                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                            <div className="font-semibold">{service.service?.title}</div>
                                                            <div className="text-sm text-muted-foreground">{service.service?.description}</div>
                                                            <div className="text-sm font-medium text-green-600 mt-1">
                                                                {t('providers.price')} {formatCurrency(service.price, 'ar')}
                                                            </div>
                                                            {service.service?.category && (
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    {t('providers.category')} {service.service.category.titleEn}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedProvider?.orders && selectedProvider.orders.length > 0 && (
                                            <div>
                                                <Label className="text-sm font-medium">{t('providers.recentOrders')}</Label>
                                                <div className="mt-1 space-y-2">
                                                    {selectedProvider.orders.slice(0, 5).map((order, index: number) => (
                                                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-semibold">{t('providers.orderNumber')} {order.id}</div>
                                                                    <div className="text-sm text-muted-foreground">{t('providers.total')}: {formatCurrency(order.totalAmount, 'ar')}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-semibold text-green-600">{formatCurrency(order.providerAmount, 'ar')}</div>
                                                                    <div className="text-sm text-muted-foreground">{t('providers.commission')} {formatCurrency(order.commissionAmount, 'ar')}</div>
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
                                    {t('providers.close')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Approve Join Request Dialog */}
                    <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{t('providers.approveJoinRequestTitle')}</DialogTitle>
                                <DialogDescription>
                                    {t('providers.approveJoinRequestDescription')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="approveNotes" className="text-sm font-medium">{t('providers.adminNotesOptional')}</Label>
                                    <Textarea
                                        id="approveNotes"
                                        value={approveNotes}
                                        onChange={(e) => setApproveNotes(e.target.value)}
                                        placeholder={t('providers.enterApproveNotes')}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                                    {t('providers.cancel')}
                                </Button>
                                <Button
                                    onClick={() => setIsApproveDialogOpen(false)}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {t('providers.approveRequest')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Reject Join Request Dialog */}
                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>{t('providers.rejectJoinRequestTitle')}</DialogTitle>
                                <DialogDescription>
                                    {t('providers.rejectJoinRequestDescription')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="rejectReason" className="text-sm font-medium">{t('providers.rejectionReasonRequired')}</Label>
                                    <Textarea
                                        id="rejectReason"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder={t('providers.enterRejectReason')}
                                        rows={3}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                                    {t('providers.cancel')}
                                </Button>
                                <Button
                                    onClick={() => setIsRejectDialogOpen(false)}
                                    disabled={!rejectReason.trim()}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {t('providers.rejectRequest')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Document Management Dialog */}
                    <DocumentManagementDialog
                        provider={selectedProvider ? {
                            ...selectedProvider,
                            email: selectedProvider.email || undefined,
                            officialDocuments: selectedProvider.officialDocuments || undefined
                        } : null}
                        isOpen={isDocumentDialogOpen}
                        onClose={() => setIsDocumentDialogOpen(false)}
                    />

                    {/* Income Details Dialog */}
                    <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>{t('providers.incomeDetails')}</DialogTitle>
                                <DialogDescription>
                                    {t('providers.detailedIncomeBreakdown').replace('{name}', selectedProvider?.name || '')}
                                </DialogDescription>
                            </DialogHeader>
                            {selectedProvider && (
                                <div className="space-y-4">
                                    {(() => {
                                        const income = calculateProviderIncome(selectedProvider.id)
                                        return (
                                            <>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="p-4 bg-green-50 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-green-700">{t('providers.totalIncome')}</span>
                                                            <span className="text-lg font-bold text-green-800">{renderCurrency(income.total)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-blue-50 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-blue-700">{t('providers.providerAmount')}</span>
                                                            <span className="text-lg font-bold text-blue-800">{renderCurrency(income.providerAmount)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-orange-50 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-orange-700">{t('providers.totalCommission')}</span>
                                                            <span className="text-lg font-bold text-orange-800">{renderCurrency(income.totalCommission)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-purple-50 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-purple-700">{t('providers.netIncome')}</span>
                                                            <span className="text-lg font-bold text-purple-800">{renderCurrency(income.netIncome)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-yellow-50 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-yellow-700">{t('providers.offerDiscounts')}</span>
                                                            <span className="text-lg font-bold text-yellow-800">{renderCurrency(income.offerDiscounts)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    })()}
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsIncomeDialogOpen(false)}>
                                    {t('providers.close')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Services & Categories Dialog */}
                    <Dialog open={isServicesDialogOpen} onOpenChange={setIsServicesDialogOpen}>
                        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden">
                            <DialogHeader>
                                <DialogTitle>{t('providers.servicesCategories')}</DialogTitle>
                                <DialogDescription>
                                    {t('providers.allServicesCategories').replace('{name}', selectedProvider?.name || '')}
                                </DialogDescription>
                            </DialogHeader>
                            {selectedProvider && (
                                <div className="space-y-6 overflow-y-auto max-h-[calc(80vh-140px)] pr-2">
                                    {selectedProvider.providerServices && selectedProvider.providerServices.length > 0 ? (
                                        <div className="space-y-4">
                                            {/* Group by categories */}
                                            {(() => {
                                                const groupedServices = selectedProvider.providerServices.reduce((acc, ps) => {
                                                    const categoryTitle = ps.service?.category?.titleEn || t('providers.uncategorized')
                                                    if (!acc[categoryTitle]) {
                                                        acc[categoryTitle] = []
                                                    }
                                                    acc[categoryTitle].push(ps)
                                                    return acc
                                                }, {} as Record<string, typeof selectedProvider.providerServices>)

                                                return Object.entries(groupedServices).map(([category, services]) => (
                                                    <div key={category} className="border rounded-lg p-4">
                                                        <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                                                            <Package className="h-5 w-5 mr-2 text-blue-600" />
                                                            {category}
                                                        </h3>
                                                        <div className="grid gap-3">
                                                            {services.map((ps, index) => {
                                                                // Find if this service has an offer
                                                                const offer = selectedProvider?.offers?.find(o =>
                                                                    o.originalPrice === ps.price
                                                                )

                                                                // Calculate commission amount
                                                                const commissionAmount = (ps.price * (ps.service?.commission || 0)) / 100
                                                                const totalWithCommission = ps.price + commissionAmount

                                                                return (
                                                                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                                                                        <div className="space-y-3">
                                                                            {/* Service Header */}
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex-1">
                                                                                    <h4 className="font-medium text-gray-900">{ps.service?.title}</h4>
                                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                                        {ps.service?.description || t('providers.noDescriptionAvailable')}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            {/* Pricing Grid */}
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                {/* Left Column - Base Price & Commission */}
                                                                                <div className="space-y-2">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="text-sm font-medium text-gray-600">{t('providers.basePrice')}</span>
                                                                                        <span className="text-sm font-semibold text-gray-900">
                                                                                            {formatCurrency(ps.price, 'ar')}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="text-sm font-medium text-gray-600">{t('providers.commission').replace('{percentage}', (ps.service?.commission || 0).toString())}</span>
                                                                                        <span className="text-sm font-semibold text-orange-600">
                                                                                            {formatCurrency(commissionAmount, 'ar')}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex items-center justify-between border-t pt-2">
                                                                                        <span className="text-sm font-medium text-gray-700">{t('providers.total')}</span>
                                                                                        <span className="text-sm font-bold text-green-700">
                                                                                            {formatCurrency(totalWithCommission, 'ar')}
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Right Column - Offers */}
                                                                                <div className="space-y-2">
                                                                                    {offer ? (
                                                                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                                                                                            <div className="text-xs font-medium text-yellow-800 mb-1">{t('providers.specialOffer')}</div>
                                                                                            <div className="space-y-1">
                                                                                                <div className="flex items-center justify-between">
                                                                                                    <span className="text-xs text-yellow-700">{t('providers.original')}</span>
                                                                                                    <span className="text-xs line-through text-yellow-600">
                                                                                                        {formatCurrency(offer.originalPrice, 'ar')}
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex items-center justify-between">
                                                                                                    <span className="text-xs text-yellow-700">{t('providers.offerPrice')}</span>
                                                                                                    <span className="text-xs font-bold text-green-600">
                                                                                                        {formatCurrency(offer.offerPrice, 'ar')}
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex items-center justify-between">
                                                                                                    <span className="text-xs text-yellow-700">{t('providers.youSave')}</span>
                                                                                                    <span className="text-xs font-bold text-green-600">
                                                                                                        {formatCurrency(offer.originalPrice - offer.offerPrice, 'ar')}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="text-center py-2">
                                                                                            <span className="text-xs text-muted-foreground">{t('providers.noOffers')}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                ))
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('providers.noServicesAvailable')}</h3>
                                            <p className="text-muted-foreground">
                                                {t('providers.noServicesDescription')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                            <DialogFooter className="flex-shrink-0 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsServicesDialogOpen(false)}>
                                    {t('providers.close')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    )
}