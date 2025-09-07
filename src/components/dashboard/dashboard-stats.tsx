'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import {
    Users,
    FolderOpen,
    DollarSign,
    TrendingUp,
    TrendingDown
} from 'lucide-react'

// Mock data - replace with actual API calls
const mockStats = {
    totalUsers: 1247,
    activeProjects: 23,
    totalRevenue: 45678,
    growthRate: 12.5,
}

const fetchStats = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return mockStats
}

export function DashboardStats() {
    const { t } = useTranslation()
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: fetchStats,
    })

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('dashboard.dashboardStats.loading')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-destructive">{t('dashboard.dashboardStats.error')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-destructive">{t('dashboard.dashboardStats.failedToLoad')}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.dashboardStats.totalUsers')}</CardTitle>
                    <div className="bg-primary/10 rounded-lg flex items-center justify-center p-2">
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gradient">{stats?.totalUsers?.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">+{stats?.growthRate}%</Badge> {t('dashboard.dashboardStats.fromLastMonth')}
                    </p>
                </CardContent>
            </Card>

            <Card className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.dashboardStats.activeProjects')}</CardTitle>
                    <div className="bg-primary/10 rounded-lg flex items-center justify-center p-2">
                        <FolderOpen className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gradient">{stats?.activeProjects}</div>
                    <p className="text-xs text-muted-foreground">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">{t('dashboard.dashboardStats.active')}</Badge> {Math.floor((stats?.activeProjects || 0) * 0.3)} {t('dashboard.dashboardStats.completedThisWeek')}
                    </p>
                </CardContent>
            </Card>

            <Card className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.dashboardStats.totalRevenue')}</CardTitle>
                    <div className="bg-primary/10 rounded-lg flex items-center justify-center p-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gradient">${stats?.totalRevenue?.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">+{stats?.growthRate}%</Badge> {t('dashboard.dashboardStats.fromLastMonth')}
                    </p>
                </CardContent>
            </Card>

            <Card className="card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.dashboardStats.growthRate')}</CardTitle>
                    <div className="bg-primary/10 rounded-lg flex items-center justify-center p-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gradient">{stats?.growthRate}%</div>
                    <p className="text-xs text-muted-foreground">
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">+2.1%</Badge> {t('dashboard.dashboardStats.fromLastWeek')}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
} 