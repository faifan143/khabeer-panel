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
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/lib/hooks/useLanguage"

export default function UsersManagementPage() {
    const { t } = useTranslation()
    const { isRTL } = useLanguage()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [startDate] = useState<string>("")
    const [endDate] = useState<string>("")

    // Fetch data
    const { data: userStats, isLoading: statsLoading } = useUserStats()
    const { data: userReport, isLoading: reportLoading } = useUserReport(startDate || undefined, endDate || undefined)
    const activateUserMutation = useAdminActivateUser()
    const deactivateUserMutation = useAdminDeactivateUser()

    // Filter users based on search and status
    const filteredUsers = userReport?.filter((user: UserReport) => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery) ||
            (user.address && user.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.state && user.state.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "active" && user.isActive) ||
            (statusFilter === "inactive" && !user.isActive)

        return matchesSearch && matchesStatus
    }) || []

    const handleActivateUser = async (userId: number) => {
        try {
            await activateUserMutation.mutateAsync(userId)
        } catch (error) {
            console.error(t('users.failedToActivateUser'), error)
        }
    }

    const handleDeactivateUser = async (userId: number) => {
        try {
            await deactivateUserMutation.mutateAsync(userId)
        } catch (error) {
            console.error(t('users.failedToDeactivateUser'), error)
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
                                <CardTitle className="text-sm font-medium">{t('users.totalUsers')}</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statsLoading ? t('users.loading') : userStats?.total || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t('users.allRegisteredUsers')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('users.activeUsers')}</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statsLoading ? t('users.loading') : userStats?.active || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t('users.currentlyActive')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('users.inactiveUsers')}</CardTitle>
                                <UserX className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statsLoading ? t('users.loading') : userStats?.inactive || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t('users.deactivatedAccounts')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{t('users.avgOrders')}</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reportLoading || !userReport?.length ? t('users.loading') :
                                        Math.round(userReport.reduce((sum: number, user: UserReport) => sum + user.completedOrders, 0) / userReport.length)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t('users.perUser')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>


                    {/* Users Table */}
                    <Card>
                        <CardHeader className="flex items-center justify-between">
                            <div>
                                <CardTitle>{t('users.usersSection', { count: filteredUsers.length })}</CardTitle>
                                <CardDescription>
                                    {t('users.manageUsersDescription')}
                                </CardDescription>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('users.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('users.filterByStatus')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('users.allUsers')}</SelectItem>
                                            <SelectItem value="active">{t('users.activeOnly')}</SelectItem>
                                            <SelectItem value="inactive">{t('users.inactiveOnly')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                            </div>
                        </CardHeader>
                        <CardContent>
                            {reportLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="text-muted-foreground">{t('users.loadingUsers')}</div>
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('users.tableHeaders.name')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('users.tableHeaders.phone')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('users.tableHeaders.address')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('users.tableHeaders.state')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('users.tableHeaders.orders')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('users.tableHeaders.payments')}</TableHead>
                                                <TableHead className={`font-semibold ${isRTL ? 'text-left' : 'text-right'}`}>{t('users.tableHeaders.actions')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.map((user: UserReport) => (
                                                <TableRow key={user.userId}>
                                                    <TableCell>
                                                        <div className={`flex items-center ${isRTL ? 'space-x-reverse gap-3' : 'gap-3'}`}>
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={user.image && process.env.NEXT_PUBLIC_API_URL_IMAGE ? process.env.NEXT_PUBLIC_API_URL_IMAGE + user.image : ""} alt={user.name} />
                                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <div className="font-medium">{user.name}</div>
                                                                <div className={`flex items-center gap-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                                                                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                                    <span className={`text-xs ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {user.isActive ? t('users.active') : t('users.inactive')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{user.phone}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-muted-foreground max-w-32 truncate">
                                                            {user.address || t('users.notApplicable')}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{user.state || t('users.notApplicable')}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className={`flex items-center ${isRTL ? 'space-x-reverse gap-1' : 'gap-1'}`}>
                                                            <Package className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm font-medium">{user.completedOrders}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className={`flex items-center ${isRTL ? 'space-x-reverse gap-1' : 'gap-1'}`}>
                                                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm font-medium">{formatCurrency(user.totalSpent, 'ar')}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse gap-2' : 'justify-end gap-2'}`}>
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
                                                                        <DialogTitle>{t('users.userDetails')}</DialogTitle>
                                                                        <DialogDescription>
                                                                            {t('users.detailedInformation', { name: user.name })}
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <Avatar className="h-12 w-12">
                                                                                <AvatarImage src={user.image || ""} alt={user.name} />
                                                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <div className="font-medium">{user.name}</div>
                                                                                <div className="text-sm text-muted-foreground">{t(`users.${user.role.toLowerCase()}`)}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                                            <div>
                                                                                <div className="font-medium">{t('users.email')}</div>
                                                                                <div className="text-muted-foreground">{user.email}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">{t('users.phone')}</div>
                                                                                <div className="text-muted-foreground">{user.phone}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">{t('users.address')}</div>
                                                                                <div className="text-muted-foreground">{user.address || t('users.notApplicable')}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">{t('users.state')}</div>
                                                                                <div className="text-muted-foreground">{user.state || t('users.notApplicable')}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">{t('users.orders')}</div>
                                                                                <div className="text-muted-foreground">{user.completedOrders}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">{t('users.totalSpent')}</div>
                                                                                <div className="text-muted-foreground">{formatCurrency(user.totalSpent, 'ar')}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">{t('users.joined')}</div>
                                                                                <div className="text-muted-foreground">{formatDate(user.createdAt)}</div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium">{t('users.status')}</div>
                                                                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                                                                    {user.isActive ? t('users.active') : t('users.inactive')}
                                                                                </Badge>
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
                                                                            <AlertDialogTitle>{t('users.deactivateUser')}</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                {t('users.deactivateUserConfirm', { name: user.name })}
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>{t('users.cancel')}</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeactivateUser(user.userId)}
                                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            >
                                                                                {t('users.deactivate')}
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
                                                                            <AlertDialogTitle>{t('users.activateUser')}</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                {t('users.activateUserConfirm', { name: user.name })}
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>{t('users.cancel')}</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleActivateUser(user.userId)}
                                                                                className="bg-green-600 hover:bg-green-700"
                                                                            >
                                                                                {t('users.activate')}
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
                                    <div className="text-muted-foreground">{t('users.noUsersFound')}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    )
} 