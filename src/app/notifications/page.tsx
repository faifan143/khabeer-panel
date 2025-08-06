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
    Send
} from "lucide-react"
import { useState, useMemo } from "react"

// Mock data - replace with actual API calls
const mockNotifications = [
    {
        id: 1,
        title: "New Service Available",
        message: "We've added new cleaning services to our platform. Check them out!",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
        targetAudience: ["customers", "providers"],
        sentAt: "2024-01-15T10:30:00Z",
        status: "sent",
        recipientsCount: 1250
    },
    {
        id: 2,
        title: "Maintenance Notice",
        message: "Our platform will be under maintenance tonight from 2-4 AM. We apologize for any inconvenience.",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
        targetAudience: ["customers"],
        sentAt: "2024-01-14T16:20:00Z",
        status: "sent",
        recipientsCount: 890
    },
    {
        id: 3,
        title: "Provider Verification Update",
        message: "New verification requirements have been implemented. Please review your documents.",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
        targetAudience: ["providers"],
        sentAt: "2024-01-13T09:15:00Z",
        status: "sent",
        recipientsCount: 340
    },
    {
        id: 4,
        title: "Holiday Schedule",
        message: "Our services will have modified hours during the upcoming holiday. Check the updated schedule.",
        image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=400&h=300&fit=crop",
        targetAudience: ["customers", "providers"],
        sentAt: "2024-01-12T14:45:00Z",
        status: "draft",
        recipientsCount: 0
    },
    {
        id: 5,
        title: "Welcome to Khabeer",
        message: "Welcome to our platform! We're excited to have you join our community of service providers and customers.",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
        targetAudience: ["customers"],
        sentAt: "2024-01-11T11:30:00Z",
        status: "sent",
        recipientsCount: 2100
    }
]

export default function NotificationsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [audienceFilter, setAudienceFilter] = useState<string>("all")
    const [selectedNotification, setSelectedNotification] = useState<any>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

    // Form state for new notification
    const [newNotification, setNewNotification] = useState({
        title: "",
        message: "",
        image: "",
        targetAudience: [] as string[],
        status: "draft"
    })

    // Filter notifications
    const filteredNotifications = useMemo(() => {
        return mockNotifications.filter(notification => {
            const matchesSearch =
                notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notification.message.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus = statusFilter === "all" || notification.status === statusFilter

            const matchesAudience = audienceFilter === "all" ||
                notification.targetAudience.includes(audienceFilter)

            return matchesSearch && matchesStatus && matchesAudience
        })
    }, [searchQuery, statusFilter, audienceFilter])

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
            case "scheduled":
                return "bg-blue-100 text-blue-800"
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

    const handleCreateNotification = () => {
        if (!newNotification.title || !newNotification.message) {
            toast.error("Please fill in all required fields")
            return
        }

        if (newNotification.targetAudience.length === 0) {
            toast.error("Please select at least one target audience")
            return
        }

        // Here you would call the API to create the notification
        console.log("Creating notification:", newNotification)

        toast.success("Notification created successfully")

        // Reset form
        setNewNotification({
            title: "",
            message: "",
            image: "",
            targetAudience: [],
            status: "draft"
        })
        setIsCreateDialogOpen(false)
    }

    const handleSendNotification = (id: number) => {
        // Here you would call the API to send the notification
        console.log("Sending notification:", id)

        toast.success("Notification sent successfully")
    }

    const handleDeleteNotification = (id: number) => {
        // Here you would call the API to delete the notification
        console.log("Deleting notification:", id)

        toast.success("Notification deleted successfully")
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="space-y-6">


                    {/* Statistics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{mockNotifications.length}</div>
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
                                    {mockNotifications.filter(n =>
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
                                <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {mockNotifications.reduce((sum, n) => sum + n.recipientsCount, 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total users reached
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Draft Notifications</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {mockNotifications.filter(n => n.status === "draft").length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Pending notifications
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
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
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
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Create New Notification</DialogTitle>
                                            <DialogDescription>
                                                Send a notification to your users with image and text
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="title">Title *</Label>
                                                <Input
                                                    id="title"
                                                    placeholder="Enter notification title"
                                                    value={newNotification.title}
                                                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="message">Message *</Label>
                                                <Textarea
                                                    id="message"
                                                    placeholder="Enter notification message"
                                                    rows={4}
                                                    value={newNotification.message}
                                                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="image">Image URL</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="image"
                                                        placeholder="Enter image URL"
                                                        value={newNotification.image}
                                                        onChange={(e) => setNewNotification(prev => ({ ...prev, image: e.target.value }))}
                                                    />
                                                    <Button variant="outline" size="sm">
                                                        <ImageIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <Label>Target Audience *</Label>
                                                <div className="flex gap-2 mt-2">
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

                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleCreateNotification}>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Create & Send
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
                                            <TableHead className="font-semibold">Message</TableHead>
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
                                                <TableCell colSpan={8} className="text-center py-8">
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
                                                        {notification.image ? (
                                                            <Avatar className="h-12 w-12">
                                                                <AvatarImage src={notification.image} alt={notification.title} />
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
                                                        <div className="max-w-xs">
                                                            <p className="text-sm line-clamp-2">{notification.message}</p>
                                                        </div>
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
                                                                                <p className="text-muted-foreground mt-2">{selectedNotification.message}</p>
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

                                                            {notification.status === "draft" && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleSendNotification(notification.id)}
                                                                >
                                                                    <Send className="h-4 w-4" />
                                                                </Button>
                                                            )}

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
                </div>
            </AdminLayout>
        </ProtectedRoute>
    )
}