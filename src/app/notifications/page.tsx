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
import toast from "react-hot-toast"
import {
    Bell,
    Plus,
    Search,
    Users,
    UserCheck,
    Calendar,
    Eye,
    Trash2,
    Image as ImageIcon,
    Send,
    Upload,
    X
} from "lucide-react"
import { useState, useMemo, useRef } from "react"
import { useNotifications, useCreateNotification, useDeleteNotification } from "@/lib/api/hooks/useAdmin"
import { api } from "@/lib/api/axios"



export default function NotificationsPage() {
    // API Hooks
    const { data: notifications = [], isLoading } = useNotifications()
    const createNotificationMutation = useCreateNotification()
    const deleteNotificationMutation = useDeleteNotification()

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [audienceFilter, setAudienceFilter] = useState<string>("all")
    const [selectedNotification, setSelectedNotification] = useState<any>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

    // Form state for new notification
    const [newNotification, setNewNotification] = useState({
        title: "",
        image: null as File | null,
        imagePreview: "",
        targetAudience: [] as string[],
        status: "draft"
    })
    const fileInputRef = useRef<HTMLInputElement>(null)

    // File handling functions
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file')
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB')
                return
            }

            setNewNotification(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }))
        }
    }

    const handleRemoveImage = () => {
        setNewNotification(prev => ({
            ...prev,
            image: null,
            imagePreview: ""
        }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        const file = event.dataTransfer.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file')
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB')
                return
            }

            setNewNotification(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }))
        }
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }

    // Filter notifications
    const filteredNotifications = useMemo(() => {
        return notifications.filter(notification => {
            const matchesSearch =
                notification.title.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus = statusFilter === "all" || notification.status === statusFilter

            const matchesAudience = audienceFilter === "all" ||
                notification.targetAudience.includes(audienceFilter)

            return matchesSearch && matchesStatus && matchesAudience
        })
    }, [notifications, searchQuery, statusFilter, audienceFilter])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "sent":
                return "bg-green-100 text-green-800"
            case "draft":
                return "bg-yellow-100 text-yellow-800"
            case "failed":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getAudienceBadges = (audience: string[]) => {
        return audience.map(aud => (
            <Badge key={aud} variant="outline" className="text-xs">
                {aud === "customers" ? "Customers" : "Providers"}
            </Badge>
        ))
    }

    const handleCreateNotification = async () => {
        if (!newNotification.title) {
            toast.error("Please fill in the notification title")
            return
        }

        if (newNotification.targetAudience.length === 0) {
            toast.error("Please select at least one target audience")
            return
        }

        try {
            await createNotificationMutation.mutateAsync({
                title: newNotification.title,
                image: newNotification.image || undefined,
                targetAudience: newNotification.targetAudience
            })

            toast.success("Notification sent successfully")

            // Reset form
            setNewNotification({
                title: "",
                image: null,
                imagePreview: "",
                targetAudience: [],
                status: "draft"
            })
            setIsCreateDialogOpen(false)
        } catch (error) {
            toast.error("Failed to send notification")
        }
    }



    const handleDeleteNotification = async (id: number) => {
        try {
            await deleteNotificationMutation.mutateAsync(id)
            toast.success("Notification deleted successfully")
        } catch (error) {
            toast.error("Failed to delete notification")
        }
    }

    const getImageUrl = (imagePath: string) => {
        // Use the correct environment variable name
        const baseUrl = process.env.NEXT_PUBLIC_API_URL_IMAGE;

        if (!baseUrl) {
            console.warn('Image base URL not configured in environment variables');
            return imagePath; // Return the path as-is if no base URL is configured
        }

        return baseUrl + imagePath;
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="space-y-6">


                    {/* Statistics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{notifications.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    All time notifications
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
                                <Send className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {notifications.filter(n =>
                                        n.status === "sent" &&
                                        new Date(n.sentAt).toDateString() === new Date().toDateString()
                                    ).length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Notifications sent today
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Failed Notifications</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {notifications.filter(n => n.status === "failed").length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Failed to send
                                </p>
                            </CardContent>
                        </Card>
                    </div>


                    {/* Notifications Table */}
                    <Card>
                        <CardHeader className="flex items-center justify-between">
                            <div>
                                <CardTitle>Notification History ({filteredNotifications.length})</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    View and manage all sent and draft notifications
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="sent">Sent</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>

                                    </SelectContent>
                                </Select>

                                <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by audience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Audience</SelectItem>
                                        <SelectItem value="customers">Customers</SelectItem>
                                        <SelectItem value="providers">Providers</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="flex items-center gap-2">
                                            <Plus className="h-4 w-4" />
                                            New Notification
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader className="border-b">
                                            <DialogTitle className="text-xl font-semibold">Create New Notification</DialogTitle>
                                            <DialogDescription className="text-sm text-muted-foreground">
                                                Send a notification to your users with title and image. Notifications are sent immediately to selected audiences.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 ">
                                            <div className="space-y-2">
                                                <Label htmlFor="title" className="text-sm font-medium">
                                                    Notification Title *
                                                </Label>
                                                <Input
                                                    id="title"
                                                    placeholder="e.g., New Service Available, Maintenance Notice"
                                                    value={newNotification.title}
                                                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                                                    className="h-10"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Keep it concise and descriptive
                                                </p>
                                            </div>
                                            <div>
                                                <Label>Notification Image</Label>
                                                <div className="space-y-3 mt-2" >
                                                    {/* File Upload Area */}
                                                    <div
                                                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${newNotification.imagePreview
                                                            ? 'border-green-300 bg-green-50'
                                                            : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                        onDrop={handleFileDrop}
                                                        onDragOver={handleDragOver}
                                                    >
                                                        {newNotification.imagePreview ? (
                                                            <div className="space-y-3">
                                                                <div className="relative inline-block">
                                                                    <img
                                                                        src={newNotification.imagePreview}
                                                                        alt="Preview"
                                                                        className="h-32 w-auto rounded-lg object-cover mx-auto"
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
                                                                <p className="text-sm text-green-600 font-medium">
                                                                    Image uploaded successfully!
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-700">
                                                                        Drop an image here, or click to select
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        PNG, JPG, GIF up to 5MB
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => fileInputRef.current?.click()}
                                                                >
                                                                    Choose File
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Hidden file input */}
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-sm font-medium">Target Audience *</Label>
                                                <div className="flex gap-3">
                                                    <Button
                                                        type="button"
                                                        variant={newNotification.targetAudience.includes("customers") ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => {
                                                            const current = newNotification.targetAudience
                                                            const updated = current.includes("customers")
                                                                ? current.filter(a => a !== "customers")
                                                                : [...current, "customers"]
                                                            setNewNotification(prev => ({ ...prev, targetAudience: updated }))
                                                        }}
                                                    >
                                                        <Users className="h-4 w-4 mr-2" />
                                                        Customers
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={newNotification.targetAudience.includes("providers") ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => {
                                                            const current = newNotification.targetAudience
                                                            const updated = current.includes("providers")
                                                                ? current.filter(a => a !== "providers")
                                                                : [...current, "providers"]
                                                            setNewNotification(prev => ({ ...prev, targetAudience: updated }))
                                                        }}
                                                    >
                                                        <UserCheck className="h-4 w-4 mr-2" />
                                                        Providers
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-6 border-t">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsCreateDialogOpen(false)}
                                                    className="px-6"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleCreateNotification}
                                                    className="px-6"
                                                    disabled={!newNotification.title || newNotification.targetAudience.length === 0}
                                                >
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Send Notification
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold">Image</TableHead>
                                            <TableHead className="font-semibold">Title</TableHead>
                                            <TableHead className="font-semibold">Target Audience</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Recipients</TableHead>
                                            <TableHead className="font-semibold">Date</TableHead>
                                            <TableHead className="font-semibold text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredNotifications.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8">
                                                    <div className="text-muted-foreground">
                                                        {searchQuery || statusFilter !== "all" || audienceFilter !== "all"
                                                            ? "No notifications found matching your criteria"
                                                            : "No notifications available"
                                                        }
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredNotifications.map((notification) => (
                                                <TableRow key={notification.id} className="hover:bg-gray-50/50">
                                                    <TableCell>
                                                        {notification.imageUrl ? (
                                                            <Avatar className="h-12 w-12">
                                                                <AvatarImage src={getImageUrl(notification.imageUrl)} alt={notification.title} />
                                                                <AvatarFallback>
                                                                    <ImageIcon className="h-4 w-4" />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        ) : (
                                                            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <ImageIcon className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{notification.title}</div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {getAudienceBadges(notification.targetAudience)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(notification.status)}>
                                                            {notification.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {notification.recipientsCount.toLocaleString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{formatDate(notification.sentAt)}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setSelectedNotification(notification)}
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-2xl">
                                                                    <DialogHeader>
                                                                        <DialogTitle>Notification Details</DialogTitle>
                                                                    </DialogHeader>
                                                                    {selectedNotification && (
                                                                        <div className="space-y-4">
                                                                            {selectedNotification.image && (
                                                                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                                                                    <img
                                                                                        src={selectedNotification.image}
                                                                                        alt={selectedNotification.title}
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <h3 className="font-semibold text-lg">{selectedNotification.title}</h3>
                                                                            </div>
                                                                            <div className="flex items-center justify-between text-sm">
                                                                                <div className="flex items-center gap-2">
                                                                                    {getAudienceBadges(selectedNotification.targetAudience)}
                                                                                </div>
                                                                                <Badge className={getStatusColor(selectedNotification.status)}>
                                                                                    {selectedNotification.status}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="text-sm text-muted-foreground">
                                                                                Sent to {selectedNotification.recipientsCount.toLocaleString()} recipients on {formatDate(selectedNotification.sentAt)}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </DialogContent>
                                                            </Dialog>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteNotification(notification.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div >
            </AdminLayout >
        </ProtectedRoute >
    )
}