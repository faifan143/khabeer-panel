"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdBanners, useCreateAdBanner, useCreateSubAdmin, useDeleteSubAdmin, useSubAdmins, useSystemSettings, useUpdateAdBanner, useUpdateSystemSetting, useUploadBannerImage, useUploadLegalDocuments, useDeleteAdBanner } from "@/lib/api/hooks/useAdmin"
import { getImageUrl } from "@/lib/utils/image"
import { AdBanner } from "@/lib/types/admin"
import {
    Eye,
    FileText,
    HeadphonesIcon,
    Megaphone,
    Save,
    Share2,
    Shield,
    Trash2,
    Upload,
    UserPlus,
    Users,
    X
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"

const availablePermissions = [
    { id: "dashboard", label: "Dashboard Access", description: "View dashboard statistics" },
    { id: "orders", label: "Orders Management", description: "Manage and view orders" },
    { id: "users", label: "Users Management", description: "Manage customer accounts" },
    { id: "providers", label: "Provider Management", description: "Manage service providers" },
    { id: "income", label: "Income & Finance", description: "View financial reports" },
    { id: "ratings", label: "Ratings & Reviews", description: "Manage ratings and reviews" },
    { id: "notifications", label: "Notifications", description: "Send system notifications" },
    { id: "settings", label: "System Settings", description: "Manage system configuration" }
]

export default function SettingsPage() {
    // API Hooks
    const { data: systemSettings, isLoading: settingsLoading } = useSystemSettings()
    const updateSettingMutation = useUpdateSystemSetting()
    const uploadLegalDocumentsMutation = useUploadLegalDocuments()
    const uploadBannerImageMutation = useUploadBannerImage()
    const { data: subAdmins, isLoading: subAdminsLoading } = useSubAdmins()
    const createSubAdminMutation = useCreateSubAdmin()
    const deleteSubAdminMutation = useDeleteSubAdmin()
    const { data: existingAdBanner, isLoading: bannerLoading } = useAdBanners()
    const createAdBannerMutation = useCreateAdBanner()
    const updateAdBannerMutation = useUpdateAdBanner()
    const deleteAdBannerMutation = useDeleteAdBanner()

    // Terms & Conditions state
    const [termsEn, setTermsEn] = useState<File | null>(null)
    const [termsAr, setTermsAr] = useState<File | null>(null)
    const [privacyEn, setPrivacyEn] = useState<File | null>(null)
    const [privacyAr, setPrivacyAr] = useState<File | null>(null)

    // Existing legal documents state
    const [existingLegalDocs, setExistingLegalDocs] = useState({
        termsEn: "",
        termsAr: "",
        privacyEn: "",
        privacyAr: ""
    })

    // Social Media Links state
    const [socialLinks, setSocialLinks] = useState({
        whatsapp: "",
        instagram: "",
        facebook: "",
        tiktok: "",
        snapchat: ""
    })

    // Technical Support state
    const [supportWhatsapp, setSupportWhatsapp] = useState("")

    // SubAdmin state
    const [isAddSubAdminOpen, setIsAddSubAdminOpen] = useState(false)
    const [newSubAdmin, setNewSubAdmin] = useState({
        name: "",
        email: "",
        password: "",
        permissions: [] as string[]
    })

    // Ad Banner state
    const [adBanners, setAdBanners] = useState<AdBanner[]>([])

    const [isAddBannerOpen, setIsAddBannerOpen] = useState(false)
    const [editingBannerIndex, setEditingBannerIndex] = useState<number | null>(null)
    const [newBanner, setNewBanner] = useState({
        title: "",
        description: "",
        image: null as File | null,
        imagePreview: "",
        linkType: "external" as "external" | "provider",
        externalLink: "",
        providerId: "",
        isActive: false
    })

    // Active tab state
    const [activeTab, setActiveTab] = useState("legal")

    // Load settings data when component mounts
    useEffect(() => {
        if (systemSettings) {
            // Load social media links
            const socialSetting = systemSettings.social?.find(s => s.key === 'social_links')
            if (socialSetting) {
                try {
                    const links = JSON.parse(socialSetting.value)
                    setSocialLinks(links)
                } catch (e) {
                    console.error('Error parsing social links:', e)
                }
            }

            // Load support links
            const supportSetting = systemSettings.support?.find(s => s.key === 'whatsapp_support')
            if (supportSetting) setSupportWhatsapp(supportSetting.value)

            // Load existing legal documents
            const legalSettings = systemSettings.legal || []
            const termsEnSetting = legalSettings.find(s => s.key === 'terms_en')
            const termsArSetting = legalSettings.find(s => s.key === 'terms_ar')
            const privacyEnSetting = legalSettings.find(s => s.key === 'privacy_en')
            const privacyArSetting = legalSettings.find(s => s.key === 'privacy_ar')

            setExistingLegalDocs({
                termsEn: termsEnSetting ? getImageUrl(termsEnSetting.value) : "",
                termsAr: termsArSetting ? getImageUrl(termsArSetting.value) : "",
                privacyEn: privacyEnSetting ? getImageUrl(privacyEnSetting.value) : "",
                privacyAr: privacyArSetting ? getImageUrl(privacyArSetting.value) : ""
            })
        }
    }, [systemSettings])

    // Load existing ad banner data when component mounts
    useEffect(() => {
        if (existingAdBanner && existingAdBanner.length > 0) {
            setAdBanners(existingAdBanner)
        }
    }, [existingAdBanner])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const termsEnInputRef = useRef<HTMLInputElement>(null)
    const termsArInputRef = useRef<HTMLInputElement>(null)
    const privacyEnInputRef = useRef<HTMLInputElement>(null)
    const privacyArInputRef = useRef<HTMLInputElement>(null)

    // File handling functions
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file')
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB')
                return
            }

            setNewBanner(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }))
        }
    }

    const handleRemoveImage = () => {
        setNewBanner(prev => ({
            ...prev,
            image: null,
            imagePreview: ""
        }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleLegalFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'termsEn' | 'termsAr' | 'privacyEn' | 'privacyAr') => {
        const file = event.target.files?.[0]
        if (file) {
            // Check if it's a PDF or text file
            if (!file.type.includes('pdf') && !file.type.includes('text') && !file.type.includes('document')) {
                toast.error('Please select a PDF or document file')
                return
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size should be less than 10MB')
                return
            }

            switch (type) {
                case 'termsEn':
                    setTermsEn(file)
                    break
                case 'termsAr':
                    setTermsAr(file)
                    break
                case 'privacyEn':
                    setPrivacyEn(file)
                    break
                case 'privacyAr':
                    setPrivacyAr(file)
                    break
            }
        }
    }

    const handleRemoveLegalFile = (type: 'termsEn' | 'termsAr' | 'privacyEn' | 'privacyAr') => {
        switch (type) {
            case 'termsEn':
                setTermsEn(null)
                if (termsEnInputRef.current) termsEnInputRef.current.value = ""
                break
            case 'termsAr':
                setTermsAr(null)
                if (termsArInputRef.current) termsArInputRef.current.value = ""
                break
            case 'privacyEn':
                setPrivacyEn(null)
                if (privacyEnInputRef.current) privacyEnInputRef.current.value = ""
                break
            case 'privacyAr':
                setPrivacyAr(null)
                if (privacyArInputRef.current) privacyArInputRef.current.value = ""
                break
        }
    }

    // Save functions
    const handleSaveTerms = async () => {
        if (!termsEn || !termsAr) {
            toast.error("Please upload both English and Arabic versions")
            return
        }

        try {
            // Upload files to server
            const uploadResult = await uploadLegalDocumentsMutation.mutateAsync([termsEn, termsAr])

            // Save file URLs to settings
            await Promise.all([
                updateSettingMutation.mutateAsync({
                    key: 'terms_en',
                    value: uploadResult.documents[0].url,
                    description: 'Terms and Conditions in English',
                    category: 'legal'
                }),
                updateSettingMutation.mutateAsync({
                    key: 'terms_ar',
                    value: uploadResult.documents[1].url,
                    description: 'Terms and Conditions in Arabic',
                    category: 'legal'
                })
            ])
            toast.success("Terms & Conditions saved successfully!")
        } catch (error) {
            toast.error("Failed to save Terms & Conditions")
        }
    }

    const handleSavePrivacy = async () => {
        if (!privacyEn || !privacyAr) {
            toast.error("Please upload both English and Arabic versions")
            return
        }

        try {
            // Upload files to server
            const uploadResult = await uploadLegalDocumentsMutation.mutateAsync([privacyEn, privacyAr])

            // Save file URLs to settings
            await Promise.all([
                updateSettingMutation.mutateAsync({
                    key: 'privacy_en',
                    value: uploadResult.documents[0].url,
                    description: 'Privacy Policy in English',
                    category: 'legal'
                }),
                updateSettingMutation.mutateAsync({
                    key: 'privacy_ar',
                    value: uploadResult.documents[1].url,
                    description: 'Privacy Policy in Arabic',
                    category: 'legal'
                })
            ])
            toast.success("Privacy Policy saved successfully!")
        } catch (error) {
            toast.error("Failed to save Privacy Policy")
        }
    }



    const handleSaveSocialLinks = async () => {
        try {
            await updateSettingMutation.mutateAsync({
                key: 'social_links',
                value: JSON.stringify(socialLinks),
                description: 'Social media links configuration',
                category: 'social'
            })
            toast.success("Social media links saved successfully!")
        } catch (error) {
            toast.error("Failed to save social media links")
        }
    }

    const handleSaveSupport = async () => {
        try {
            await updateSettingMutation.mutateAsync({
                key: 'whatsapp_support',
                value: supportWhatsapp,
                description: 'WhatsApp support link',
                category: 'support'
            })
            toast.success("Support links saved successfully!")
        } catch (error) {
            toast.error("Failed to save support links")
        }
    }

    const handleAddSubAdmin = async () => {
        if (!newSubAdmin.name || !newSubAdmin.email || !newSubAdmin.password || newSubAdmin.permissions.length === 0) {
            toast.error("Please fill all required fields")
            return
        }

        try {
            await createSubAdminMutation.mutateAsync({
                name: newSubAdmin.name,
                email: newSubAdmin.email,
                password: newSubAdmin.password,
                permissions: newSubAdmin.permissions
            })
            setNewSubAdmin({ name: "", email: "", password: "", permissions: [] })
            setIsAddSubAdminOpen(false)
            toast.success("Sub-admin added successfully!")
        } catch (error) {
            toast.error("Failed to add sub-admin")
        }
    }

    const handleDeleteSubAdmin = async (id: number) => {
        try {
            await deleteSubAdminMutation.mutateAsync(id)
            toast.success("Sub-admin removed successfully!")
        } catch (error) {
            toast.error("Failed to remove sub-admin")
        }
    }

    const handleSaveAdBanner = async () => {
        if (!newBanner.title.trim() || !newBanner.description.trim()) {
            toast.error("Please fill all required fields")
            return
        }

        if (newBanner.linkType === "external" && !newBanner.externalLink.trim()) {
            toast.error("Please provide external link")
            return
        }

        if (newBanner.linkType === "provider" && !newBanner.providerId) {
            toast.error("Please select a provider")
            return
        }

        try {
            const bannerData: any = {
                title: newBanner.title.trim(),
                description: newBanner.description.trim(),
                linkType: newBanner.linkType,
                externalLink: newBanner.externalLink.trim(),
                providerId: newBanner.providerId ? parseInt(newBanner.providerId) : undefined,
                isActive: newBanner.isActive
            }

            // Add image file if exists
            if (newBanner.image) {
                bannerData.image = newBanner.image
            }

            // If editing existing banner, update it; otherwise create new one
            if (editingBannerIndex !== null) {
                await updateAdBannerMutation.mutateAsync({
                    id: adBanners[editingBannerIndex].id,
                    data: bannerData
                })
            } else {
                await createAdBannerMutation.mutateAsync(bannerData)
            }

            toast.success("Ad banner configuration saved successfully!")
            setIsAddBannerOpen(false)
            setEditingBannerIndex(null)
            setNewBanner({ title: "", description: "", image: null, imagePreview: "", linkType: "external", externalLink: "", providerId: "", isActive: false })
        } catch (error) {
            toast.error("Failed to save ad banner configuration")
            console.error("Error saving ad banner:", error)
        }
    }

    const handleEditBanner = (index: number) => {
        const banner = adBanners[index]
        setNewBanner({
            title: banner.title,
            description: banner.description,
            image: null,
            imagePreview: banner.imageUrl ? getImageUrl(banner.imageUrl) : "",
            linkType: banner.linkType,
            externalLink: banner.externalLink || "",
            providerId: banner.providerId?.toString() || "",
            isActive: banner.isActive
        })
        setEditingBannerIndex(index)
        setIsAddBannerOpen(true)
    }

    const handleDeleteBanner = async (id: number) => {
        if (confirm("Are you sure you want to delete this banner?")) {
            try {
                await deleteAdBannerMutation.mutateAsync(id)
                toast.success("Banner deleted successfully!")
            } catch (error) {
                toast.error("Failed to delete banner")
                console.error("Error deleting banner:", error)
            }
        }
    }

    const handleCreateBanner = () => {
        setNewBanner({ title: "", description: "", image: null, imagePreview: "", linkType: "external", externalLink: "", providerId: "", isActive: false })
        setEditingBannerIndex(null)
        setIsAddBannerOpen(true)
    }

    const handleCancelEdit = () => {
        setIsAddBannerOpen(false)
        setEditingBannerIndex(null)
        setNewBanner({ title: "", description: "", image: null, imagePreview: "", linkType: "external", externalLink: "", providerId: "", isActive: false })
    }

    const handlePermissionToggle = (permissionId: string) => {
        setNewSubAdmin(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId]
        }))
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="space-y-6">


                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="legal">Legal</TabsTrigger>
                            <TabsTrigger value="social">Social Media</TabsTrigger>
                            <TabsTrigger value="support">Support</TabsTrigger>
                            <TabsTrigger value="subadmins">Sub-Admins</TabsTrigger>
                            <TabsTrigger value="ads">Ad Banners</TabsTrigger>
                        </TabsList>

                        {/* Legal Documents */}
                        <TabsContent value="legal" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Terms & Conditions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Terms & Conditions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">English Version</Label>
                                            <div className="space-y-3 mt-2">
                                                {termsEn ? (
                                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center space-x-2">
                                                            <FileText className="h-5 w-5 text-blue-500" />
                                                            <span className="text-sm font-medium">{termsEn.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ({(termsEn.size / 1024 / 1024).toFixed(2)} MB)
                                                            </span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveLegalFile('termsEn')}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : existingLegalDocs.termsEn ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                                            <div className="flex items-center space-x-2">
                                                                <FileText className="h-5 w-5 text-green-500" />
                                                                <span className="text-sm font-medium">Terms & Conditions (English)</span>
                                                                <span className="text-xs text-muted-foreground">(Current)</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => window.open(existingLegalDocs.termsEn, '_blank')}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                                            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-sm text-gray-600 mb-2">Upload new file to replace current</p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => termsEnInputRef.current?.click()}
                                                            >
                                                                Choose New File
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600 mb-2">Upload Terms & Conditions (English)</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => termsEnInputRef.current?.click()}
                                                        >
                                                            Choose File
                                                        </Button>
                                                    </div>
                                                )}
                                                <input
                                                    ref={termsEnInputRef}
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.txt"
                                                    onChange={(e) => handleLegalFileSelect(e, 'termsEn')}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Arabic Version</Label>
                                            <div className="space-y-3 mt-2">
                                                {termsAr ? (
                                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center space-x-2">
                                                            <FileText className="h-5 w-5 text-blue-500" />
                                                            <span className="text-sm font-medium">{termsAr.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ({(termsAr.size / 1024 / 1024).toFixed(2)} MB)
                                                            </span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveLegalFile('termsAr')}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : existingLegalDocs.termsAr ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                                            <div className="flex items-center space-x-2">
                                                                <FileText className="h-5 w-5 text-green-500" />
                                                                <span className="text-sm font-medium">Terms & Conditions (Arabic)</span>
                                                                <span className="text-xs text-muted-foreground">(Current)</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => window.open(existingLegalDocs.termsAr, '_blank')}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                                            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-sm text-gray-600 mb-2">Upload new file to replace current</p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => termsArInputRef.current?.click()}
                                                            >
                                                                Choose New File
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600 mb-2">Upload Terms & Conditions (Arabic)</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => termsArInputRef.current?.click()}
                                                        >
                                                            Choose File
                                                        </Button>
                                                    </div>
                                                )}
                                                <input
                                                    ref={termsArInputRef}
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.txt"
                                                    onChange={(e) => handleLegalFileSelect(e, 'termsAr')}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleSaveTerms} className="w-full">
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Terms & Conditions
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Privacy Policy */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            Privacy Policy
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">English Version</Label>
                                            <div className="space-y-3 mt-2">
                                                {privacyEn ? (
                                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center space-x-2">
                                                            <FileText className="h-5 w-5 text-blue-500" />
                                                            <span className="text-sm font-medium">{privacyEn.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ({(privacyEn.size / 1024 / 1024).toFixed(2)} MB)
                                                            </span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveLegalFile('privacyEn')}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : existingLegalDocs.privacyEn ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                                            <div className="flex items-center space-x-2">
                                                                <FileText className="h-5 w-5 text-green-500" />
                                                                <span className="text-sm font-medium">Privacy Policy (English)</span>
                                                                <span className="text-xs text-muted-foreground">(Current)</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => window.open(existingLegalDocs.privacyEn, '_blank')}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                                            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-sm text-gray-600 mb-2">Upload new file to replace current</p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => privacyEnInputRef.current?.click()}
                                                            >
                                                                Choose New File
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600 mb-2">Upload Privacy Policy (English)</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => privacyEnInputRef.current?.click()}
                                                        >
                                                            Choose File
                                                        </Button>
                                                    </div>
                                                )}
                                                <input
                                                    ref={privacyEnInputRef}
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.txt"
                                                    onChange={(e) => handleLegalFileSelect(e, 'privacyEn')}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Arabic Version</Label>
                                            <div className="space-y-3 mt-2">
                                                {privacyAr ? (
                                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center space-x-2">
                                                            <FileText className="h-5 w-5 text-blue-500" />
                                                            <span className="text-sm font-medium">{privacyAr.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ({(privacyAr.size / 1024 / 1024).toFixed(2)} MB)
                                                            </span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveLegalFile('privacyAr')}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : existingLegalDocs.privacyAr ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                                            <div className="flex items-center space-x-2">
                                                                <FileText className="h-5 w-5 text-green-500" />
                                                                <span className="text-sm font-medium">Privacy Policy (Arabic)</span>
                                                                <span className="text-xs text-muted-foreground">(Current)</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => window.open(existingLegalDocs.privacyAr, '_blank')}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                                            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-sm text-gray-600 mb-2">Upload new file to replace current</p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => privacyArInputRef.current?.click()}
                                                            >
                                                                Choose New File
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600 mb-2">Upload Privacy Policy (Arabic)</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => privacyArInputRef.current?.click()}
                                                        >
                                                            Choose File
                                                        </Button>
                                                    </div>
                                                )}
                                                <input
                                                    ref={privacyArInputRef}
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.txt"
                                                    onChange={(e) => handleLegalFileSelect(e, 'privacyAr')}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleSavePrivacy} className="w-full">
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Privacy Policy
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Social Media Links */}
                        <TabsContent value="social" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Share2 className="h-5 w-5" />
                                        Social Media Links
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Configure your social media presence links
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium">WhatsApp</Label>
                                            <Input
                                                placeholder="https://wa.me/your-number"
                                                value={socialLinks.whatsapp}
                                                onChange={(e) => setSocialLinks(prev => ({ ...prev, whatsapp: e.target.value }))}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Instagram</Label>
                                            <Input
                                                placeholder="https://instagram.com/your-handle"
                                                value={socialLinks.instagram}
                                                onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Facebook</Label>
                                            <Input
                                                placeholder="https://facebook.com/your-page"
                                                value={socialLinks.facebook}
                                                onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">TikTok</Label>
                                            <Input
                                                placeholder="https://tiktok.com/@your-handle"
                                                value={socialLinks.tiktok}
                                                onChange={(e) => setSocialLinks(prev => ({ ...prev, tiktok: e.target.value }))}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Snapchat</Label>
                                            <Input
                                                placeholder="https://snapchat.com/add/your-handle"
                                                value={socialLinks.snapchat}
                                                onChange={(e) => setSocialLinks(prev => ({ ...prev, snapchat: e.target.value }))}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <Button onClick={handleSaveSocialLinks} className="w-full">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Social Media Links
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Technical Support */}
                        <TabsContent value="support" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <HeadphonesIcon className="h-5 w-5" />
                                        Technical Support
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Configure support contact information
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium">WhatsApp Support</Label>
                                        <Input
                                            placeholder="https://wa.me/support-number"
                                            value={supportWhatsapp}
                                            onChange={(e) => setSupportWhatsapp(e.target.value)}
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This link will be used for customer support inquiries
                                        </p>
                                    </div>
                                    <Button onClick={handleSaveSupport} className="w-full">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Support Links
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Sub-Admins Management */}
                        <TabsContent value="subadmins" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                Sub-Administrators
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                Manage sub-administrators with limited permissions
                                            </p>
                                        </div>
                                        <Dialog open={isAddSubAdminOpen} onOpenChange={setIsAddSubAdminOpen}>
                                            <DialogTrigger asChild>
                                                <Button>
                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                    Add Sub-Admin
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Add New Sub-Administrator</DialogTitle>
                                                    <DialogDescription>
                                                        Create a new sub-admin with specific permissions
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label>Name *</Label>
                                                        <Input
                                                            placeholder="Enter full name"
                                                            value={newSubAdmin.name}
                                                            onChange={(e) => setNewSubAdmin(prev => ({ ...prev, name: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Email *</Label>
                                                        <Input
                                                            type="email"
                                                            placeholder="Enter email address"
                                                            value={newSubAdmin.email}
                                                            onChange={(e) => setNewSubAdmin(prev => ({ ...prev, email: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Password *</Label>
                                                        <Input
                                                            type="password"
                                                            placeholder="Enter password"
                                                            value={newSubAdmin.password}
                                                            onChange={(e) => setNewSubAdmin(prev => ({ ...prev, password: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Permissions *</Label>
                                                        <div className="space-y-2 mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                                                            {availablePermissions.map((permission) => (
                                                                <div key={permission.id} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={permission.id}
                                                                        checked={newSubAdmin.permissions.includes(permission.id)}
                                                                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                                                                    />
                                                                    <div className="flex-1">
                                                                        <Label htmlFor={permission.id} className="text-sm font-medium">
                                                                            {permission.label}
                                                                        </Label>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {permission.description}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 pt-4">
                                                        <Button variant="outline" onClick={() => setIsAddSubAdminOpen(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button onClick={handleAddSubAdmin}>
                                                            Add Sub-Admin
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Permissions</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subAdminsLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8">
                                                        <div className="text-muted-foreground">Loading sub-admins...</div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : subAdmins && subAdmins.length > 0 ? (
                                                subAdmins.map((admin) => (
                                                    <TableRow key={admin.id}>
                                                        <TableCell className="font-medium">{admin.name}</TableCell>
                                                        <TableCell>{admin.email}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {admin.permissions.map((permission) => (
                                                                    <Badge key={permission} variant="secondary" className="text-xs">
                                                                        {permission}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={admin.isActive ? "default" : "secondary"}>
                                                                {admin.isActive ? "active" : "inactive"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{formatDate(admin.createdAt)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteSubAdmin(admin.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8">
                                                        <div className="text-muted-foreground">No sub-admins found</div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Ad Banner Configuration */}
                        <TabsContent value="ads" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Megaphone className="h-5 w-5" />
                                        Ad Banner Management
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Manage promotional banners and links
                                    </p>
                                    <Button onClick={handleCreateBanner} className="mt-2">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add New Banner
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {bannerLoading ? (
                                        <div className="text-center py-8">
                                            <div className="text-muted-foreground">Loading banners...</div>
                                        </div>
                                    ) : adBanners.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Image</TableHead>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Link Type</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Created</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {adBanners.map((banner, index) => (
                                                    <TableRow key={banner.id}>
                                                        <TableCell>
                                                            {banner.imageUrl ? (
                                                                <img
                                                                    src={getImageUrl(banner.imageUrl)}
                                                                    alt={banner.title}
                                                                    className="h-16 w-auto rounded object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-16 w-24 bg-gray-100 rounded flex items-center justify-center">
                                                                    <span className="text-xs text-gray-500">No Image</span>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{banner.title}</TableCell>
                                                        <TableCell className="max-w-xs truncate">{banner.description}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {banner.linkType === "external" ? "External Link" : "Provider Page"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={banner.isActive ? "default" : "secondary"}>
                                                                {banner.isActive ? "Active" : "Inactive"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(banner.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleEditBanner(index)}
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                </Button>
                                                                {banner.id && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteBanner(banner.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-muted-foreground">No banners found</div>
                                            <Button onClick={handleCreateBanner} className="mt-2">
                                                Create Your First Banner
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Add/Edit Banner Dialog */}
                            <Dialog open={isAddBannerOpen} onOpenChange={setIsAddBannerOpen}>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingBannerIndex !== null ? "Edit Banner" : "Add New Banner"}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {editingBannerIndex !== null
                                                ? "Update the banner information below"
                                                : "Fill in the banner information below"
                                            }
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Banner Title *</Label>
                                                <Input
                                                    placeholder="Enter banner title"
                                                    value={newBanner.title}
                                                    onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Description *</Label>
                                                <Input
                                                    placeholder="Enter banner description"
                                                    value={newBanner.description}
                                                    onChange={(e) => setNewBanner(prev => ({ ...prev, description: e.target.value }))}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Banner Image</Label>
                                            <div className="space-y-3 mt-2">
                                                {newBanner.imagePreview ? (
                                                    <div className="relative inline-block">
                                                        <img
                                                            src={newBanner.imagePreview}
                                                            alt="Banner Preview"
                                                            className="h-32 w-auto rounded-lg object-cover"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                            onClick={handleRemoveImage}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600 mb-2">Upload banner image</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => fileInputRef.current?.click()}
                                                        >
                                                            Choose File
                                                        </Button>
                                                    </div>
                                                )}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">Link Type</Label>
                                            <Select
                                                value={newBanner.linkType}
                                                onValueChange={(value) => setNewBanner(prev => ({ ...prev, linkType: value as "external" | "provider" }))}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="external">External Link</SelectItem>
                                                    <SelectItem value="provider">Provider Page</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {newBanner.linkType === "external" ? (
                                            <div>
                                                <Label className="text-sm font-medium">External Link *</Label>
                                                <Input
                                                    placeholder="https://example.com"
                                                    value={newBanner.externalLink}
                                                    onChange={(e) => setNewBanner(prev => ({ ...prev, externalLink: e.target.value }))}
                                                    className="mt-1"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <Label className="text-sm font-medium">Select Provider *</Label>
                                                <Select
                                                    value={newBanner.providerId}
                                                    onValueChange={(value) => setNewBanner(prev => ({ ...prev, providerId: value }))}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Choose a provider" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">Provider 1</SelectItem>
                                                        <SelectItem value="2">Provider 2</SelectItem>
                                                        <SelectItem value="3">Provider 3</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="banner-active"
                                                checked={newBanner.isActive}
                                                onCheckedChange={(checked) => setNewBanner(prev => ({ ...prev, isActive: checked as boolean }))}
                                            />
                                            <Label htmlFor="banner-active" className="text-sm font-medium">
                                                Activate this banner
                                            </Label>
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={handleCancelEdit}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSaveAdBanner}>
                                                <Save className="h-4 w-4 mr-2" />
                                                {editingBannerIndex !== null ? "Update Banner" : "Create Banner"}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </TabsContent>
                    </Tabs>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    )
} 