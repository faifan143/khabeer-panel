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
import { Category, CreateCategoryDto, CreateServiceDto, Service, UpdateCategoryDto, UpdateServiceDto } from "@/lib/api/types"
import { formatCurrency } from "@/lib/utils"
import {
    CheckCircle,
    DollarSign,
    Edit,
    Filter,
    Grid,
    List,
    Package,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    TrendingUp,
    Upload,
    XCircle
} from "lucide-react"
import { useMemo, useState } from "react"
import toast from "react-hot-toast"

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
    const [activeTab, setActiveTab] = useState("categories")
    const [searchTerm, setSearchTerm] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null)
    const [serviceImageFile, setServiceImageFile] = useState<File | null>(null)

    // Categories hooks
    const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useCategories()
    const createCategoryMutation = useCreateCategory()
    const updateCategoryMutation = useUpdateCategory()
    const deleteCategoryMutation = useDeleteCategory()

    // Services hooks
    const { data: servicesResponse, isLoading: servicesLoading, refetch: refetchServices } = useServices()
    const createServiceMutation = useCreateService()
    const updateServiceMutation = useUpdateService()
    const deleteServiceMutation = useDeleteService()

    // Extract data from responses
    const services = (Array.isArray(servicesResponse) ? servicesResponse : servicesResponse?.data) as Service[] || []

    // Computed statistics
    const categoryStats = useMemo(() => ({
        total: categories.length,
        withState: categories.filter(c => c.state && c.state.trim() !== '').length,
        withoutState: categories.filter(c => !c.state || c.state.trim() === '').length,
        statePercentage: categories.length > 0 ? Math.round((categories.filter(c => c.state && c.state.trim() !== '').length / categories.length) * 100) : 0
    }), [categories])

    const serviceStats = useMemo(() => {
        const totalCommission = services.reduce((sum, s) => sum + s.commission, 0)
        const avgCommission = services.length > 0 ? totalCommission / services.length : 0
        const withCategory = services.filter(s => s.categoryId).length

        return {
            total: services.length,
            withCategory,
            avgCommission: Math.round(avgCommission * 100) / 100,
            totalCommission: Math.round(totalCommission * 100) / 100,
            categoryPercentage: services.length > 0 ? Math.round((withCategory / services.length) * 100) : 0
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
        image: "",
        state: ""
    })

    // Service form state
    const [serviceForm, setServiceForm] = useState<CreateServiceDto>({
        title: "",
        description: "",
        commission: 0,
        whatsapp: "",
        image: "",
        categoryId: undefined
    })

    const resetCategoryForm = () => {
        setCategoryForm({
            titleEn: "",
            titleAr: "",
            image: "",
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
            image: "",
            categoryId: undefined
        })
        setSelectedService(null)
        setServiceImageFile(null)
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
                toast.success("Category updated successfully!")
            } else {
                await createCategoryMutation.mutateAsync({
                    categoryData: categoryForm,
                    imageFile: categoryImageFile || undefined
                })
                toast.success("Category created successfully!")
            }
            setIsCategoryDialogOpen(false)
            resetCategoryForm()
            refetchCategories()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save category")
        }
    }

    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (selectedService) {
                await updateServiceMutation.mutateAsync({
                    id: selectedService.id,
                    serviceData: serviceForm as UpdateServiceDto,
                    imageFile: serviceImageFile || undefined
                })
                toast.success("Service updated successfully!")
            } else {
                await createServiceMutation.mutateAsync({
                    serviceData: serviceForm,
                    imageFile: serviceImageFile || undefined
                })
                toast.success("Service created successfully!")
            }
            setIsServiceDialogOpen(false)
            resetServiceForm()
            refetchServices()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save service")
        }
    }

    const handleCategoryEdit = (category: Category) => {
        setSelectedCategory(category)
        setCategoryForm({
            titleEn: category.titleEn,
            titleAr: category.titleAr,
            image: category.image,
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
            commission: service.commission,
            whatsapp: service.whatsapp,
            image: service.image,
            categoryId: service.categoryId
        })
        setServiceImageFile(null)
        setIsServiceDialogOpen(true)
    }

    const handleCategoryDelete = async (id: number) => {
        try {
            await deleteCategoryMutation.mutateAsync(id)
            toast.success("Category deleted successfully!")
            refetchCategories()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete category")
        }
    }

    const handleServiceDelete = async (id: number) => {
        try {
            await deleteServiceMutation.mutateAsync(id)
            toast.success("Service deleted successfully!")
            refetchServices()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete service")
        }
    }

    const handleImageUpload = (file: File, type: 'category' | 'service') => {
        const maxSize = 5 * 1024 * 1024 // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']

        if (file.size > maxSize) {
            toast.error('Image size must be less than 5MB')
            return
        }

        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, GIF)')
            return
        }

        if (type === 'category') {
            setCategoryImageFile(file)
        } else {
            setServiceImageFile(file)
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

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="space-y-8">
                    {/* Enhanced Header */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Categories & Services</h1>
                                <p className="text-lg text-muted-foreground mt-1">
                                    Manage your service categories and individual services with ease
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (activeTab === "categories") refetchCategories()
                                        else refetchServices()
                                    }}
                                    className="flex items-center space-x-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Refresh</span>
                                </Button>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search categories or services..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-80"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <TabsList className="grid w-auto grid-cols-2 bg-gray-100 p-1">
                                <TabsTrigger
                                    value="categories"
                                    className="px-8 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Categories
                                </TabsTrigger>
                                <TabsTrigger
                                    value="services"
                                    className="px-8 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Services
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center space-x-3">
                                {/* Status Filter */}
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {activeTab === "categories" ? (
                                            <>
                                                <SelectItem value="withState">With State</SelectItem>
                                                <SelectItem value="withoutState">Without State</SelectItem>
                                            </>
                                        ) : (
                                            <>
                                                <SelectItem value="withCategory">With Category</SelectItem>
                                                <SelectItem value="withoutCategory">Without Category</SelectItem>
                                            </>
                                        )}
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
                                                Add Category
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl">
                                                    {selectedCategory ? "Edit Category" : "Add New Category"}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    {selectedCategory ? "Update the category information below." : "Create a new service category to organize your services."}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleCategorySubmit} className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="titleEn" className="text-sm font-medium">English Title</Label>
                                                        <Input
                                                            id="titleEn"
                                                            value={categoryForm.titleEn}
                                                            onChange={(e) => setCategoryForm({ ...categoryForm, titleEn: e.target.value })}
                                                            placeholder="Enter English title"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="titleAr" className="text-sm font-medium">Arabic Title</Label>
                                                        <Input
                                                            id="titleAr"
                                                            value={categoryForm.titleAr}
                                                            onChange={(e) => setCategoryForm({ ...categoryForm, titleAr: e.target.value })}
                                                            placeholder="أدخل العنوان بالعربية"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="categoryImage" className="text-sm font-medium">Category Image</Label>
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
                                                            Selected: {categoryImageFile.name}
                                                        </p>
                                                    )}
                                                    {selectedCategory?.image && !categoryImageFile && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Current image: {selectedCategory.image}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="state" className="text-sm font-medium">State</Label>
                                                    <Input
                                                        id="state"
                                                        value={categoryForm.state}
                                                        onChange={(e) => setCategoryForm({ ...categoryForm, state: e.target.value })}
                                                        placeholder="Enter state (e.g., New York, Texas, California)"
                                                        required
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                                    >
                                                        {selectedCategory ? "Update Category" : "Create Category"}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button onClick={resetServiceForm} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Service
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl">
                                                    {selectedService ? "Edit Service" : "Add New Service"}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    {selectedService ? "Update the service information below." : "Create a new service with detailed information."}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleServiceSubmit} className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="serviceTitle" className="text-sm font-medium">Service Title</Label>
                                                    <Input
                                                        id="serviceTitle"
                                                        value={serviceForm.title}
                                                        onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                                                        placeholder="Enter service title"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                                    <Textarea
                                                        id="description"
                                                        value={serviceForm.description}
                                                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                                        placeholder="Enter service description"
                                                        rows={3}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="commission" className="text-sm font-medium">Commission (OMR)</Label>
                                                        <Input
                                                            id="commission"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={serviceForm.commission}
                                                            onChange={(e) => setServiceForm({ ...serviceForm, commission: parseFloat(e.target.value) || 0 })}
                                                            placeholder="0.00"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp Number</Label>
                                                        <Input
                                                            id="whatsapp"
                                                            value={serviceForm.whatsapp}
                                                            onChange={(e) => setServiceForm({ ...serviceForm, whatsapp: e.target.value })}
                                                            placeholder="+968 1234 5678"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="categoryId" className="text-sm font-medium">Category</Label>
                                                    <Select
                                                        value={serviceForm.categoryId?.toString() || ""}
                                                        onValueChange={(value) => setServiceForm({ ...serviceForm, categoryId: value ? parseInt(value) : undefined })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category (optional)" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.filter(c => c.state === 'active').map((category) => (
                                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                                    {category.titleEn}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="serviceImage" className="text-sm font-medium">Service Image</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <Input
                                                            id="serviceImage"
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) handleImageUpload(file, 'service')
                                                            }}
                                                            className="flex-1"
                                                        />
                                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    {serviceImageFile && (
                                                        <p className="text-xs text-green-600">
                                                            Selected: {serviceImageFile.name}
                                                        </p>
                                                    )}
                                                    {selectedService?.image && !serviceImageFile && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Current image: {selectedService.image}
                                                        </p>
                                                    )}
                                                </div>
                                                <DialogFooter>
                                                    <Button type="button" variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                                    >
                                                        {selectedService ? "Update Service" : "Create Service"}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>

                        {/* Categories Tab */}
                        <TabsContent value="categories" className="space-y-6">
                            {/* Enhanced Stats Display */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatCard
                                    title="Total Categories"
                                    value={categoryStats.total}
                                    icon={Package}
                                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                                    description={`${categoryStats.statePercentage}% have state info`}
                                />
                                <StatCard
                                    title="With State"
                                    value={categoryStats.withState}
                                    icon={CheckCircle}
                                    color="bg-gradient-to-br from-green-500 to-emerald-600"
                                    description="Categories with location"
                                />
                                <StatCard
                                    title="Without State"
                                    value={categoryStats.withoutState}
                                    icon={XCircle}
                                    color="bg-gradient-to-br from-orange-500 to-red-600"
                                    description="Missing location info"
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
                                    {filteredCategories.map((category) => (
                                        <Card key={category.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 hover:from-blue-50/50 hover:to-indigo-50/50">
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-4 flex-1">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                                            {category.image ? (
                                                                <img src={category.image} alt={category.titleEn} className="w-8 h-8 rounded object-cover" />
                                                            ) : (
                                                                <Package className="h-6 w-6 text-white" />
                                                            )}
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
                                                                        No location
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
                                                                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete "{category.titleEn}"? This action cannot be undone and will affect all associated services.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleCategoryDelete(category.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Delete Category
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
                                                <TableHead className="font-semibold">Category</TableHead>
                                                <TableHead className="font-semibold">State</TableHead>
                                                <TableHead className="font-semibold text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCategories.map((category) => (
                                                <TableRow key={category.id} className="hover:bg-gray-50/50">
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                                                {category.image ? (
                                                                    <img src={category.image} alt={category.titleEn} className="w-8 h-8 rounded object-cover" />
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
                                                                No location
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
                                                                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete "{category.titleEn}"? This action cannot be undone and will affect all associated services.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleCategoryDelete(category.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Delete Category
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

                        {/* Services Tab */}
                        <TabsContent value="services" className="space-y-6">
                            {/* Enhanced Stats Display */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard
                                    title="Total Services"
                                    value={serviceStats.total}
                                    icon={Package}
                                    color="bg-gradient-to-br from-violet-500 to-purple-600"
                                    description="All available services"
                                />
                                <StatCard
                                    title="With Category"
                                    value={serviceStats.withCategory}
                                    icon={Filter}
                                    color="bg-gradient-to-br from-cyan-500 to-blue-600"
                                    description={`${serviceStats.categoryPercentage}% categorized`}
                                />
                                <StatCard
                                    title="Avg Commission"
                                    value={`${serviceStats.avgCommission} OMR`}
                                    icon={DollarSign}
                                    color="bg-gradient-to-br from-amber-500 to-orange-600"
                                    description="Per service average"
                                />
                                <StatCard
                                    title="Total Commission"
                                    value={`${serviceStats.totalCommission} OMR`}
                                    icon={DollarSign}
                                    color="bg-gradient-to-br from-emerald-500 to-teal-600"
                                    description="Combined value"
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
                                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                                            {service.image ? (
                                                                <img src={service.image} alt={service.title} className="w-8 h-8 rounded object-cover" />
                                                            ) : (
                                                                <Package className="h-6 w-6 text-white" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-gray-900 truncate">{service.title}</h3>
                                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{service.description}</p>
                                                            <div className="flex items-center justify-between mt-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {renderCurrency(service.commission)}
                                                                    </span>
                                                                    {service.category && (
                                                                        <Badge variant="outline" className="text-xs px-2 py-1">
                                                                            {service.category.titleEn}
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
                                                                    <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete "{service.title}"? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleServiceDelete(service.id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Delete Service
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
                                                <TableHead className="font-semibold">Service</TableHead>
                                                <TableHead className="font-semibold">Category</TableHead>
                                                <TableHead className="font-semibold">Commission</TableHead>
                                                <TableHead className="font-semibold">WhatsApp</TableHead>
                                                <TableHead className="font-semibold text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredServices.map((service) => (
                                                <TableRow key={service.id} className="hover:bg-gray-50/50">
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                                                {service.image ? (
                                                                    <img src={service.image} alt={service.title} className="w-8 h-8 rounded object-cover" />
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
                                                                {service.category.titleEn}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">No category</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-semibold text-gray-900">{renderCurrency(service.commission)}</span>
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
                                                                        <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete "{service.title}"? This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleServiceDelete(service.id)}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Delete Service
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
                </div>
            </AdminLayout>
        </ProtectedRoute>
    )
}
