"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminActivateUser, useAdminDeactivateUser, useUserReport, useUserStats } from "@/lib/api/hooks/useAdmin"
import { UserReport } from "@/lib/types/admin"
import { formatCurrency } from "@/lib/utils"
import { Calendar, DollarSign, Eye, Package, Search, Star, UserCheck, Users, UserX } from "lucide-react"
import { useState } from "react"

export default function UsersManagementPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")

    // Fetch data
    const { data: userStats, isLoading: statsLoading } = useUserStats()
    const { data: userReport, isLoading: reportLoading } = useUserReport(startDate || undefined, endDate || undefined)
    const activateUserMutation = useAdminActivateUser()
    const deactivateUserMutation = useAdminDeactivateUser()

    // Filter users based on search and status
    const filteredUsers = userReport?.filter((user: UserReport) => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery)

        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "active" && user.isActive) ||
            (statusFilter === "inactive" && !user.isActive)

        return matchesSearch && matchesStatus
    }) || []

    const handleActivateUser = async (userId: number) => {
        try {
            await activateUserMutation.mutateAsync(userId)
        } catch (error) {
            console.error("Failed to activate user:", error)
        }
    }

    const handleDeactivateUser = async (userId: number) => {
        try {
            await deactivateUserMutation.mutateAsync(userId)
        } catch (error) {
            console.error("Failed to deactivate user:", error)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        })
    }

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }



    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statsLoading ? "..." : userStats?.total || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    All registered users
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statsLoading ? "..." : userStats?.active || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Currently active
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
                                <UserX className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statsLoading ? "..." : userStats?.inactive || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Deactivated accounts
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Orders</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reportLoading || !userReport?.length ? "..." :
                                        Math.round(userReport.reduce((sum: number, user: UserReport) => sum + user.completedOrders, 0) / userReport.length)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Per user
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters & Search</CardTitle>
                            <CardDescription>
                                Filter and search through user accounts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name, email, or phone..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Users</SelectItem>
                                            <SelectItem value="active">Active Only</SelectItem>
                                            <SelectItem value="inactive">Inactive Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date</label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Date</label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Users ({filteredUsers.length})</CardTitle>
                            <CardDescription>
                                Detailed view of all users with their activity and engagement metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {reportLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="text-muted-foreground">Loading users...</div>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Contact</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead>Orders</TableHead>
                                                <TableHead>Spent</TableHead>
                                                <TableHead>Ratings</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.map((user: UserReport) => (
                                                <TableRow key={user.userId}>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar>
                                                                <AvatarImage src="" />
                                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{user.name}</div>
                                                                <div className="text-sm text-muted-foreground">{user.role}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="text-sm">{user.email}</div>
                                                            <div className="text-sm text-muted-foreground">{user.phone}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.isActive ? "default" : "secondary"}>
                                                            {user.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">{formatDate(user.createdAt)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-1">
                                                            <Package className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">{user.completedOrders}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-1">
                                                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">{formatCurrency(user.totalSpent)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-1">
                                                            <Star className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">{user.ratingsGiven}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-md">
                                                                    <DialogHeader>
                                                                        <DialogTitle>User Details</DialogTitle>
                                                                        <DialogDescription>
                                                                            Detailed information about {user.name}
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center space-x-3">
                                                                            <Avatar>
                                                                                <AvatarImage src="" />
                                                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <div className="font-medium">{user.name}</div>
                                                                                <div className="text-sm text-muted-foreground">{user.role}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                                            <div>
                                                                                <div className="font-medium">Email</div>
                                                                                <div className="text-muted-foreground">{user.email}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">Phone</div>
                                                                                <div className="text-muted-foreground">{user.phone}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">Joined</div>
                                                                                <div className="text-muted-foreground">{formatDate(user.createdAt)}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">Status</div>
                                                                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                                                                    {user.isActive ? "Active" : "Inactive"}
                                                                                </Badge>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">Orders</div>
                                                                                <div className="text-muted-foreground">{user.completedOrders}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">Total Spent</div>
                                                                                <div className="text-muted-foreground">{formatCurrency(user.totalSpent)}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>

                                                            {user.isActive ? (
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="outline" size="sm">
                                                                            <UserX className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Deactivate User</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to deactivate {user.name}? This will prevent them from accessing the platform.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeactivateUser(user.userId)}
                                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            >
                                                                                Deactivate
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            ) : (
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="outline" size="sm">
                                                                            <UserCheck className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Activate User</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to activate {user.name}? This will allow them to access the platform.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleActivateUser(user.userId)}
                                                                                className="bg-green-600 hover:bg-green-700"
                                                                            >
                                                                                Activate
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
                                </div>
                            )}

                            {!reportLoading && filteredUsers.length === 0 && (
                                <div className="flex items-center justify-center h-32">
                                    <div className="text-muted-foreground">No users found matching your criteria</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    )
} 