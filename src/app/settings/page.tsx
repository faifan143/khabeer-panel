"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import toast from "react-hot-toast"
import {
    Settings,
    FileText,
    Shield,
    Share2,
    HeadphonesIcon,
    Users,
    Megaphone,
    Plus,
    Edit,
    Trash2,
    Save,
    Upload,
    Link,
    ExternalLink,
    UserPlus,
    Eye,
    EyeOff,
    X
} from "lucide-react"
import { useState, useMemo, useRef, useEffect } from "react"
import { useSystemSettings, useUpdateSystemSetting, useSubAdmins, useCreateSubAdmin, useDeleteSubAdmin, useAdBanners, useCreateAdBanner, useUpdateAdBanner, useDeleteAdBanner } from "@/lib/api/hooks/useAdmin"

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
    const { data: subAdmins, isLoading: subAdminsLoading } = useSubAdmins()
    const createSubAdminMutation = useCreateSubAdmin()
    const deleteSubAdminMutation = useDeleteSubAdmin()
    const { data: existingAdBanner, isLoading: bannerLoading } = useAdBanners()
    const updateAdBannerMutation = useUpdateAdBanner()

    // Terms & Conditions state
    const [termsEn, setTermsEn] = useState<File | null>(null)
    const [termsAr, setTermsAr] = useState<File | null>(null)
    const [privacyEn, setPrivacyEn] = useState<File | null>(null)
    const [privacyAr, setPrivacyAr] = useState<File | null>(null)

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
    const [adBannerConfig, setAdBannerConfig] = useState({
        title: "",
        description: "",
        image: null as File | null,
        imagePreview: "",
        linkType: "external",
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
        }
    }, [systemSettings])

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

            setAdBannerConfig(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }))
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

    const handleRemoveImage = () => {
        setAdBannerConfig(prev => ({
            ...prev,
            image: null,
            imagePreview: ""
        }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    // Save functions
    const handleSaveTerms = async () => {
        if (!termsEn || !termsAr) {
            toast.error("Please upload both English and Arabic versions")
            return
        }

        try {
            // Convert files to base64 or upload to server
            const termsEnBase64 = await fileToBase64(termsEn)
            const termsArBase64 = await fileToBase64(termsAr)

            await Promise.all([
                updateSettingMutation.mutateAsync({
                    key: 'terms_en',
                    value: termsEnBase64,
                    description: 'Terms and Conditions in English',
                    category: 'legal'
                }),
                updateSettingMutation.mutateAsync({
                    key: 'terms_ar',
                    value: termsArBase64,
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
            // Convert files to base64 or upload to server
            const privacyEnBase64 = await fileToBase64(privacyEn)
            const privacyArBase64 = await fileToBase64(privacyAr)

            await Promise.all([
                updateSettingMutation.mutateAsync({
                    key: 'privacy_en',
                    value: privacyEnBase64,
                    description: 'Privacy Policy in English',
                    category: 'legal'
                }),
                updateSettingMutation.mutateAsync({
                    key: 'privacy_ar',
                    value: privacyArBase64,
                    description: 'Privacy Policy in Arabic',
                    category: 'legal'
                })
            ])
            toast.success("Privacy Policy saved successfully!")
        } catch (error) {
            toast.error("Failed to save Privacy Policy")
        }
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
        })
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
        if (!adBannerConfig.title || !adBannerConfig.description) {
            toast.error("Please fill all required fields")
            return
        }

        if (adBannerConfig.linkType === "external" && !adBannerConfig.externalLink) {
            toast.error("Please provide external link")
            return
        }

        if (adBannerConfig.linkType === "provider" && !adBannerConfig.providerId) {
            toast.error("Please select a provider")
            return
        }

        try {
            // For single banner, we'll use the first banner ID or create if none exists
            const bannerId = existingAdBanner?.[0]?.id || 1
            await updateAdBannerMutation.mutateAsync({
                id: bannerId,
                data: {
                    title: adBannerConfig.title,
                    description: adBannerConfig.description,
                    imageUrl: adBannerConfig.imagePreview,
                    linkType: adBannerConfig.linkType,
                    externalLink: adBannerConfig.externalLink,
                    providerId: adBannerConfig.providerId ? parseInt(adBannerConfig.providerId) : undefined,
                    isActive: adBannerConfig.isActive
                }
            })

            toast.success("Ad banner configuration saved successfully!")
        } catch (error) {
            toast.error("Failed to save ad banner configuration")
        }
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
                                        Ad Banner Configuration
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Configure promotional banners and links
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium">Banner Title *</Label>
                                            <Input
                                                placeholder="Enter banner title"
                                                value={adBannerConfig.title}
                                                onChange={(e) => setAdBannerConfig(prev => ({ ...prev, title: e.target.value }))}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Description *</Label>
                                            <Input
                                                placeholder="Enter banner description"
                                                value={adBannerConfig.description}
                                                onChange={(e) => setAdBannerConfig(prev => ({ ...prev, description: e.target.value }))}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">Banner Image</Label>
                                        <div className="space-y-3 mt-2">
                                            {adBannerConfig.imagePreview ? (
                                                <div className="relative inline-block">
                                                    <img
                                                        src={adBannerConfig.imagePreview}
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
                                            value={adBannerConfig.linkType}
                                            onValueChange={(value) => setAdBannerConfig(prev => ({ ...prev, linkType: value as "external" | "provider" }))}
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

                                    {adBannerConfig.linkType === "external" ? (
                                        <div>
                                            <Label className="text-sm font-medium">External Link *</Label>
                                            <Input
                                                placeholder="https://example.com"
                                                value={adBannerConfig.externalLink}
                                                onChange={(e) => setAdBannerConfig(prev => ({ ...prev, externalLink: e.target.value }))}
                                                className="mt-1"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <Label className="text-sm font-medium">Select Provider *</Label>
                                            <Select
                                                value={adBannerConfig.providerId}
                                                onValueChange={(value) => setAdBannerConfig(prev => ({ ...prev, providerId: value }))}
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
                                            checked={adBannerConfig.isActive}
                                            onCheckedChange={(checked) => setAdBannerConfig(prev => ({ ...prev, isActive: checked as boolean }))}
                                        />
                                        <Label htmlFor="banner-active" className="text-sm font-medium">
                                            Activate this banner
                                        </Label>
                                    </div>

                                    <Button onClick={handleSaveAdBanner} className="w-full">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Ad Banner Configuration
                                    </Button>
                                </CardContent>
                            </Card>


                        </TabsContent>
                    </Tabs>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    )
} 