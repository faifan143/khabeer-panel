"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useCategories, useCreateCategory, useCreateService, useDeleteCategory, useDeleteService, useServices, useUpdateCategory, useUpdateService } from "@/lib/api/hooks/useServices"
import { Category, CreateCategoryDto, CreateServiceDto, Service, UpdateCategoryDto, UpdateServiceDto, ServiceType } from "@/lib/api/types"
import { ServiceTypeSelectionDialog } from "@/components/forms/service-type-selection-dialog"
import { NormalServiceForm } from "@/components/forms/normal-service-form"
import { KhabeerServiceForm } from "@/components/forms/khabeer-service-form"
import { formatCurrency } from "@/lib/utils"
import { getCategoryImageUrl, getServiceImageUrl } from "@/lib/utils/image"
import { SearchBox } from "@/components/ui/search-box"
import {
    CheckCircle,
    DollarSign,
    Edit,
    Filter,
    Grid,
    List,
    Package,
    Plus,
    Trash2,
    TrendingUp,
    Upload,
    XCircle
} from "lucide-react"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

// Oman Governorates constant
const OMAN_GOVERNORATES = [
    { value: "Muscat", label: "Muscat - مسقط" },
    { value: "Dhofar", label: "Dhofar - ظفار" },
    { value: "Musandam", label: "Musandam - مسندم" },
    { value: "Buraimi", label: "Buraimi - البريمي" },
    { value: "Dakhiliyah", label: "Dakhiliyah - الداخلية" },
    { value: "North Al Batinah", label: "North Al Batinah - شمال الباطنة" },
    { value: "South Al Batinah", label: "South Al Batinah - جنوب الباطنة" },
    { value: "North Al Sharqiyah", label: "North Al Sharqiyah - شمال الشرقية" },
    { value: "South Al Sharqiyah", label: "South Al Sharqiyah - جنوب الشرقية" },
    { value: "Al Wusta", label: "Al Wusta - الوسطى" }
]

// Loading Skeleton Components
const CategoryCardSkeleton = () => (
    <Card className="animate-pulse">
        <CardContent className="p-6">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
            </div>
        </CardContent>
    </Card>
)

const ServiceCardSkeleton = () => (
    <Card className="animate-pulse">
        <CardContent className="p-6">
            <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="flex space-x-2">
                        <div className="h-5 bg-muted rounded w-16"></div>
                        <div className="h-5 bg-muted rounded w-20"></div>
                    </div>
                </div>
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
                            <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {trend.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />}
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

export default function CategoriesServicesPage() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState("categories")
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
    const [isNormalServiceDialogOpen, setIsNormalServiceDialogOpen] = useState(false)
    const [isKhabeerServiceDialogOpen, setIsKhabeerServiceDialogOpen] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all")
    const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null)
    const [serviceImageFile, setServiceImageFile] = useState<File | null>(null)

    // Categories hooks
    const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useCategories()
    const createCategoryMutation = useCreateCategory()
    const updateCategoryMutation = useUpdateCategory()
    const deleteCategoryMutation = useDeleteCategory()

    // Services hooks
    const { data: servicesResponse, isLoading: servicesLoading, refetch: refetchServices } = useServices(1, 100, serviceTypeFilter === "all" ? undefined : serviceTypeFilter as ServiceType)
    const createServiceMutation = useCreateService()
    const updateServiceMutation = useUpdateService()
    const deleteServiceMutation = useDeleteService()

    // Extract data from responses
    const services = useMemo(() => {
        return (Array.isArray(servicesResponse) ? servicesResponse : servicesResponse?.data) as Service[] || []
    }, [servicesResponse])

    // Computed statistics
    const categoryStats = useMemo(() => ({
        total: categories.length,
        withState: categories.filter(c => c.state && c.state.trim() !== '').length,
        withoutState: categories.filter(c => !c.state || c.state.trim() === '').length,
        statePercentage: categories.length > 0 ? Math.round((categories.filter(c => c.state && c.state.trim() !== '').length / categories.length) * 100) : 0
    }), [categories])

    const serviceStats = useMemo(() => {
        const normalServices = services.filter(s => s.serviceType === 'NORMAL')
        const khabeerServices = services.filter(s => s.serviceType === 'KHABEER')
        const totalCommission = normalServices.reduce((sum, s) => sum + (s.commission || 0), 0)
        const avgCommission = normalServices.length > 0 ? totalCommission / normalServices.length : 0
        const withCategory = normalServices.filter(s => s.categoryId).length

        return {
            total: services.length,
            normal: normalServices.length,
            khabeer: khabeerServices.length,
            withCategory,
            avgCommission: Math.round(avgCommission * 100) / 100,
            totalCommission: Math.round(totalCommission * 100) / 100,
            categoryPercentage: normalServices.length > 0 ? Math.round((withCategory / normalServices.length) * 100) : 0
        }
    }, [services])

    // Filter data based on search and status
    const filteredCategories = useMemo(() => {
        let filtered = categories.filter(category =>
            category.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.titleAr.includes(searchTerm) ||
            category.state.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (filterStatus !== "all") {
            filtered = filtered.filter(category =>
                filterStatus === "withState" ? (category.state && category.state.trim() !== '') : (!category.state || category.state.trim() === '')
            )
        }

        return filtered
    }, [categories, searchTerm, filterStatus])

    const filteredServices = useMemo(() => {
        let filtered = services.filter(service =>
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (filterStatus !== "all") {
            filtered = filtered.filter(service =>
                filterStatus === "withCategory" ? service.categoryId : !service.categoryId
            )
        }

        return filtered
    }, [services, searchTerm, filterStatus])

    // Category form state
    const [categoryForm, setCategoryForm] = useState<CreateCategoryDto>({
        titleEn: "",
        titleAr: "",
        state: ""
    })

    // Service form state
    const [serviceForm, setServiceForm] = useState<CreateServiceDto>({
        title: "",
        description: "",
        commission: 0,
        whatsapp: "",
        categoryId: undefined,
        state: undefined
    })

    const resetCategoryForm = () => {
        setCategoryForm({
            titleEn: "",
            titleAr: "",
            state: ""
        })
        setSelectedCategory(null)
        setCategoryImageFile(null)
    }

    const resetServiceForm = () => {
        setServiceForm({
            title: "",
            description: "",
            commission: 0,
            whatsapp: "",
            categoryId: undefined,
            state: undefined,
            serviceType: 'NORMAL'
        })
        setSelectedService(null)
        setServiceImageFile(null)
    }

    const handleServiceTypeSelect = (serviceType: ServiceType) => {
        if (serviceType === 'NORMAL') {
            setIsNormalServiceDialogOpen(true)
        } else {
            setIsKhabeerServiceDialogOpen(true)
        }
    }

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (selectedCategory) {
                await updateCategoryMutation.mutateAsync({
                    id: selectedCategory.id,
                    categoryData: categoryForm as UpdateCategoryDto,
                    imageFile: categoryImageFile || undefined
                })
                toast.success(t('categories.categoryUpdated'))
            } else {
                await createCategoryMutation.mutateAsync({
                    categoryData: categoryForm,
                    imageFile: categoryImageFile || undefined
                })
                toast.success(t('categories.categoryCreated'))
            }
            setIsCategoryDialogOpen(false)
            resetCategoryForm()
            refetchCategories()
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('categories.failedToSaveCategory')
            toast.error(errorMessage)
        }
    }

    const handleServiceSubmit = async (serviceData: CreateServiceDto | UpdateServiceDto, imageFile?: File) => {
        try {
            if (selectedService) {
                await updateServiceMutation.mutateAsync({
                    id: selectedService.id,
                    serviceData: serviceData as UpdateServiceDto,
                    imageFile: imageFile
                })
                toast.success(t('categories.serviceUpdated'))
            } else {
                await createServiceMutation.mutateAsync({
                    serviceData: serviceData as CreateServiceDto,
                    imageFile: imageFile
                })
                toast.success(t('categories.serviceCreated'))
            }
            resetServiceForm()
            refetchServices()
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('categories.failedToSaveService')
            toast.error(errorMessage)
            throw error
        }
    }

    const handleCategoryEdit = (category: Category) => {
        setSelectedCategory(category)
        setCategoryForm({
            titleEn: category.titleEn,
            titleAr: category.titleAr,
            state: category.state
        })
        setCategoryImageFile(null)
        setIsCategoryDialogOpen(true)
    }

    const handleServiceEdit = (service: Service) => {
        setSelectedService(service)
        setServiceForm({
            title: service.title,
            description: service.description,
            commission: service.commission || 0,
            whatsapp: service.whatsapp,
            categoryId: service.categoryId || undefined,
            state: service.state,
            serviceType: service.serviceType
        })
        setServiceImageFile(null)

        if (service.serviceType === 'NORMAL') {
            setIsNormalServiceDialogOpen(true)
        } else {
            setIsKhabeerServiceDialogOpen(true)
        }
    }

    const handleCategoryDelete = async (id: number) => {
        try {
            await deleteCategoryMutation.mutateAsync(id)
            toast.success(t('categories.categoryDeleted'))
            refetchCategories()
            refetchServices() // Also refetch services since some might be deleted
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('categories.failedToDeleteCategory')
            toast.error(errorMessage)
        }
    }

    const handleServiceDelete = async (id: number) => {
        try {
            await deleteServiceMutation.mutateAsync(id)
            toast.success(t('categories.serviceDeleted'))
            refetchServices()
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t('categories.failedToDeleteService')
            toast.error(errorMessage)
        }
    }

    const handleImageUpload = (file: File, type: 'category' | 'service') => {
        const maxSize = 5 * 1024 * 1024 // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']

        if (file.size > maxSize) {
            toast.error(t('categories.imageValidation.sizeLimit'))
            return
        }

        if (!allowedTypes.includes(file.type)) {
            toast.error(t('categories.imageValidation.fileType'))
            return
        }

        if (type === 'category') {
            setCategoryImageFile(file)
        } else {
            setServiceImageFile(file)
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
                    {/* Enhanced Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <TabsList className="grid w-auto grid-cols-2 bg-gray-100 p-1">
                                <TabsTrigger
                                    value="categories"
                                    className="px-8 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    {t('categories.categories')}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="services"
                                    className="px-8 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    {t('categories.services')}
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center space-x-3">
                                {/* Search Box */}
                                <SearchBox
                                    placeholder={activeTab === "categories" ? t('categories.searchCategories') : t('categories.searchServices')}
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    className="w-64"
                                />
                                {/* Status Filter */}
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder={t('categories.filterByStatus')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('categories.all')}</SelectItem>
                                        {activeTab === "categories" ? (
                                            <>
                                                <SelectItem value="withState">{t('categories.withState')}</SelectItem>
                                                <SelectItem value="withoutState">{t('categories.withoutState')}</SelectItem>
                                            </>
                                        ) : (
                                            <>
                                                <SelectItem value="withCategory">{t('categories.withCategory')}</SelectItem>
                                                <SelectItem value="withoutCategory">{t('categories.withoutCategory')}</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>

                                {/* Service Type Filter - Only show for services tab */}
                                {activeTab === "services" && (
                                    <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder={t('categories.filterByType')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('categories.allTypes')}</SelectItem>
                                            <SelectItem value="NORMAL">{t('categories.normalServices')}</SelectItem>
                                            <SelectItem value="KHABEER">{t('categories.khabeerServices')}</SelectItem>
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
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("list")}
                                        className="h-8 w-8 p-0"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Add Button */}
                                {activeTab === "categories" ? (
                                    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button onClick={resetCategoryForm} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                                <Plus className="h-4 w-4 mr-2" />
                                                {t('categories.addCategory')}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl">
                                                    {selectedCategory ? t('categories.editCategory') : t('categories.addCategory')}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    {selectedCategory ? t('categories.updateCategoryInfo') : t('categories.createNewCategory')}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleCategorySubmit} className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="titleEn" className="text-sm font-medium">{t('categories.englishTitle')}</Label>
                                                        <Input
                                                            id="titleEn"
                                                            value={categoryForm.titleEn}
                                                            onChange={(e) => setCategoryForm({ ...categoryForm, titleEn: e.target.value })}
                                                            placeholder={t('categories.enterEnglishTitle')}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="titleAr" className="text-sm font-medium">{t('categories.arabicTitle')}</Label>
                                                        <Input
                                                            id="titleAr"
                                                            value={categoryForm.titleAr}
                                                            onChange={(e) => setCategoryForm({ ...categoryForm, titleAr: e.target.value })}
                                                            placeholder={t('categories.enterArabicTitle')}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="categoryImage" className="text-sm font-medium">{t('categories.image')}</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Input
                                                            id="categoryImage"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) handleImageUpload(file, 'category')
                                                            }}
                                                            className="flex-1"
                                                        />
                                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    {categoryImageFile && (
                                                        <p className="text-xs text-green-600">
                                                            {t('categories.fileStatus.selected', { fileName: categoryImageFile.name })}
                                                        </p>
                                                    )}
                                                    {selectedCategory?.image && !categoryImageFile && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {t('categories.fileStatus.currentImage', { fileName: selectedCategory.image })}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="state" className="text-sm font-medium">{t('categories.state')}</Label>
                                                    <Select
                                                        value={categoryForm.state}
                                                        onValueChange={(value) => setCategoryForm({ ...categoryForm, state: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('categories.selectState')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {OMAN_GOVERNORATES.map((governorate) => (
                                                                <SelectItem key={governorate.value} value={governorate.value}>
                                                                    {governorate.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                                                        {t('categories.cancel')}
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                                    >
                                                        {selectedCategory ? t('categories.updateCategory') : t('categories.createCategory')}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <ServiceTypeSelectionDialog onServiceTypeSelect={handleServiceTypeSelect}>
                                        <Button onClick={resetServiceForm} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                                            <Plus className="h-4 w-4 mr-2" />
                                            {t('categories.addService')}
                                        </Button>
                                    </ServiceTypeSelectionDialog>
                                )}
                            </div>
                        </div>

                        {/* Categories Tab */}
                        <TabsContent value="categories" className="space-y-6">
                            {/* Enhanced Stats Display */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatCard
                                    title={t('categories.totalCategories')}
                                    value={categoryStats.total}
                                    icon={Package}
                                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                                    description={`${categoryStats.statePercentage}% ${t('categories.haveStateInfo')}`}
                                />
                                <StatCard
                                    title={t('categories.withState')}
                                    value={categoryStats.withState}
                                    icon={CheckCircle}
                                    color="bg-gradient-to-br from-green-500 to-emerald-600"
                                    description={t('categories.categoriesWithLocation')}
                                />
                                <StatCard
                                    title={t('categories.withoutState')}
                                    value={categoryStats.withoutState}
                                    icon={XCircle}
                                    color="bg-gradient-to-br from-orange-500 to-red-600"
                                    description={t('categories.missingLocationInfo')}
                                />
                            </div>

                            {/* Categories Display */}
                            {categoriesLoading ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <CategoryCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : viewMode === "grid" ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredCategories.map((category) => {
                                        return (
                                            <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 hover:from-blue-50/50 hover:to-indigo-50/50">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center space-x-4 flex-1">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                                                                {
                                                                    category.image && getCategoryImageUrl(category.image) ? (
                                                                        <img src={getCategoryImageUrl(category.image)} alt={category.titleEn} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Package className="h-6 w-6 text-white" />
                                                                    )
                                                                }
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold text-gray-900 truncate">{category.titleEn}</h3>
                                                                <p className="text-sm text-muted-foreground truncate mt-1">{category.titleAr}</p>
                                                                <div className="flex items-center mt-3">
                                                                    {category.state && category.state.trim() !== '' ? (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-200"
                                                                        >
                                                                            📍 {category.state}
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className="text-xs px-3 py-1 bg-gray-100 text-gray-600"
                                                                        >
                                                                            {t('categories.noLocation')}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCategoryEdit(category)}
                                                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>{t('categories.deleteConfirmations.categoryTitle')}</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            {t('categories.deleteConfirmations.categoryDescription', { title: category.titleEn })}:
                                                                            <br />• {t('categories.deleteConfirmations.allServicesInCategory')}
                                                                            <br />• {t('categories.deleteConfirmations.allInvoicesAndOrders')}
                                                                            <br />• {t('categories.deleteConfirmations.allProviderServices')}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleCategoryDelete(category.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            {t('categories.deleteCategory')}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
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
                                            <TableRow className="bg-gray-50 ">
                                                <TableHead className="font-semibold rtl:text-right  ">{t('categories.tableHeaders.category')}</TableHead>
                                                <TableHead className="font-semibold rtl:text-right ">{t('categories.tableHeaders.state')}</TableHead>
                                                <TableHead className="font-semibold rtl:text-right ">{t('categories.tableHeaders.actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCategories.map((category) => {
                                                return (
                                                    <TableRow key={category.id} className="hover:bg-gray-50/50">
                                                        <TableCell>
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center overflow-hidden">
                                                                    {category.image ? (
                                                                        <img src={getCategoryImageUrl(category.image)} alt={category.titleEn} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Package className="h-5 w-5 text-white" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">{category.titleEn}</div>
                                                                    <div className="text-sm text-muted-foreground">{category.titleAr}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {category.state && category.state.trim() !== '' ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-blue-50 text-blue-700 border-blue-200"
                                                                >
                                                                    📍 {category.state}
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-gray-100 text-gray-600"
                                                                >
                                                                    {t('categories.noLocation')}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleCategoryEdit(category)}
                                                                    className="h-8 w-8 p-0 hover:bg-blue-100"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>{t('categories.deleteConfirmations.categoryTitle')}</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                {t('categories.deleteConfirmations.categoryDescription', { title: category.titleEn })}:
                                                                                <br />• {t('categories.deleteConfirmations.allServicesInCategory')}
                                                                                <br />• {t('categories.deleteConfirmations.allInvoicesAndOrders')}
                                                                                <br />• {t('categories.deleteConfirmations.allProviderServices')}
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleCategoryDelete(category.id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                {t('categories.deleteCategory')}
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Services Tab */}
                        <TabsContent value="services" className="space-y-6">
                            {/* Enhanced Stats Display */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <StatCard
                                    title={t('categories.totalServices')}
                                    value={serviceStats.total}
                                    icon={Package}
                                    color="bg-gradient-to-br from-violet-500 to-purple-600"
                                    description={t('categories.allAvailableServices')}
                                />
                                <StatCard
                                    title={t('categories.normalServices')}
                                    value={serviceStats.normal}
                                    icon={Package}
                                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                                    description={t('categories.marketplaceServices')}
                                />
                                <StatCard
                                    title={t('categories.khabeerServices')}
                                    value={serviceStats.khabeer}
                                    icon={Package}
                                    color="bg-gradient-to-br from-purple-500 to-pink-600"
                                    description={t('categories.directContactServices')}
                                />
                                <StatCard
                                    title={t('categories.avgCommission')}
                                    value={`${serviceStats.avgCommission} ${t('categories.currency.omr')}`}
                                    icon={DollarSign}
                                    color="bg-gradient-to-br from-amber-500 to-orange-600"
                                    description={t('categories.perServiceAverage')}
                                />
                                <StatCard
                                    title={t('categories.totalCommission')}
                                    value={`${serviceStats.totalCommission} ${t('categories.currency.omr')}`}
                                    icon={DollarSign}
                                    color="bg-gradient-to-br from-emerald-500 to-teal-600"
                                    description={t('categories.combinedValue')}
                                />
                            </div>

                            {/* Services Display */}
                            {servicesLoading ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <ServiceCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : viewMode === "grid" ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredServices.map((service) => (
                                        <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 hover:from-green-50/50 hover:to-emerald-50/50">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-4 flex-1">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                                                            {service.image ? (
                                                                <img src={getServiceImageUrl(service.image)} alt={service.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="h-6 w-6 text-white" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 truncate">{service.title}</h3>
                                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{service.description}</p>
                                                            <div className="flex items-center justify-between mt-3">
                                                                <div className="flex items-center space-x-2">
                                                                    {service.commission && (
                                                                        <span className="text-sm font-medium text-gray-900">
                                                                            {renderCurrency(service.commission)}
                                                                        </span>
                                                                    )}
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`text-xs px-2 py-1 ${service.serviceType === 'NORMAL'
                                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                            : 'bg-purple-50 text-purple-700 border-purple-200'
                                                                            }`}
                                                                    >
                                                                        {service.serviceType === 'NORMAL' ? 'NORMAL' : 'KHABEER'}
                                                                    </Badge>
                                                                    {service.category ? (
                                                                        <Badge variant="outline" className="text-xs px-2 py-1">
                                                                            {service.category.titleEn}
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="outline" className={`text-xs px-2 py-1 ${service.serviceType === 'KHABEER'
                                                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                                            : 'bg-gray-50 text-gray-700 border-gray-200'
                                                                            }`}>
                                                                            {service.serviceType === 'KHABEER' ? 'فئة خبير' : 'لا توجد فئة'}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleServiceEdit(service)}
                                                            className="h-8 w-8 p-0 hover:bg-green-100"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>{t('categories.deleteConfirmations.serviceTitle')}</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        {t('categories.deleteConfirmations.serviceDescription', { title: service.title })}:
                                                                        <br />• {t('categories.deleteConfirmations.invoicesAndOrdersForService')}
                                                                        <br />• {t('categories.deleteConfirmations.providerServicesForService')}
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleServiceDelete(service.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        {t('categories.deleteService')}
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
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
                                                <TableHead className="font-semibold  rtl:text-right">{t('categories.tableHeaders.service')}</TableHead>
                                                <TableHead className="font-semibold  rtl:text-right">{t('categories.tableHeaders.category')}</TableHead>
                                                <TableHead className="font-semibold  rtl:text-right">{t('categories.tableHeaders.commission')}</TableHead>
                                                <TableHead className="font-semibold  rtl:text-right">{t('categories.tableHeaders.whatsapp')}</TableHead>
                                                <TableHead className="font-semibold  rtl:text-right ">{t('categories.tableHeaders.actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredServices.map((service) => (
                                                <TableRow key={service.id} className="hover:bg-gray-50/50">
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center overflow-hidden">
                                                                {service.image ? (
                                                                    <img src={getServiceImageUrl(service.image)} alt={service.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Package className="h-5 w-5 text-white" />
                                                                )}
                                                            </div>
                                                            <div className="max-w-[300px]">
                                                                <div className="font-semibold text-gray-900 truncate">{service.title}</div>
                                                                <div className="text-sm text-muted-foreground line-clamp-1">
                                                                    {service.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {service.category ? (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                {service.category.titleEn} {service.category.titleAr}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                                {service.serviceType === 'KHABEER' ? 'فئة خبير' : t('categories.noCategory')}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold text-gray-900">
                                                            {service.commission !== null ? renderCurrency(service.commission) : 'N/A'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground font-mono">{service.whatsapp}</span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleServiceEdit(service)}
                                                                className="h-8 w-8 p-0 hover:bg-green-100"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>{t('categories.deleteConfirmations.serviceTitle')}</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            {t('categories.deleteConfirmations.serviceDescription', { title: service.title })}:
                                                                            <br />• {t('categories.deleteConfirmations.invoicesAndOrdersForService')}
                                                                            <br />• {t('categories.deleteConfirmations.providerServicesForService')}
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleServiceDelete(service.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            {t('categories.deleteService')}
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
                        </TabsContent>
                    </Tabs>

                    {/* Service Form Components */}
                    <NormalServiceForm
                        isOpen={isNormalServiceDialogOpen}
                        onClose={() => {
                            setIsNormalServiceDialogOpen(false)
                            resetServiceForm()
                        }}
                        onSubmit={handleServiceSubmit}
                        selectedService={selectedService}
                        categories={categories}
                        isLoading={createServiceMutation.isPending || updateServiceMutation.isPending}
                    />

                    <KhabeerServiceForm
                        isOpen={isKhabeerServiceDialogOpen}
                        onClose={() => {
                            setIsKhabeerServiceDialogOpen(false)
                            resetServiceForm()
                        }}
                        onSubmit={handleServiceSubmit}
                        selectedService={selectedService}
                        isLoading={createServiceMutation.isPending || updateServiceMutation.isPending}
                    />
                </div>
            </AdminLayout>
        </ProtectedRoute>
    )
}
