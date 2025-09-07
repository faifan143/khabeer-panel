'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { showInfo } from '@/lib/utils/toast'
import { useTranslation } from 'react-i18next'
import {
    FolderPlus,
    UserPlus,
    BarChart3,
    Rocket,
    FolderOpen,
    CheckCircle,
    Clock,
    Activity
} from 'lucide-react'

const quickActions = [
    {
        id: 1,
        title: t('dashboard.quickActions.createProject'),
        description: t('dashboard.quickActions.startNewProject'),
        icon: FolderPlus,
        action: t('dashboard.quickActions.createProject'),
        variant: 'default' as const,
    },
    {
        id: 2,
        title: t('dashboard.quickActions.addUser'),
        description: t('dashboard.quickActions.inviteTeamMember'),
        icon: UserPlus,
        action: t('dashboard.quickActions.addUser'),
        variant: 'secondary' as const,
    },
    {
        id: 3,
        title: t('dashboard.quickActions.generateReport'),
        description: t('dashboard.quickActions.createAnalyticsReport'),
        icon: BarChart3,
        action: t('dashboard.quickActions.generateReport'),
        variant: 'outline' as const,
    },
    {
        id: 4,
        title: t('dashboard.quickActions.deploy'),
        description: t('dashboard.quickActions.deployToProduction'),
        icon: Rocket,
        action: t('dashboard.quickActions.deploy'),
        variant: 'destructive' as const,
    },
]

const recentProjects = [
    {
        id: 1,
        name: 'E-commerce Platform',
        status: 'active',
        lastUpdated: '2 hours ago',
    },
    {
        id: 2,
        name: 'Mobile App',
        status: 'development',
        lastUpdated: '1 day ago',
    },
    {
        id: 3,
        name: 'API Gateway',
        status: 'completed',
        lastUpdated: '3 days ago',
    },
]

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'active':
            return <Badge variant="default" className="flex items-center gap-1"><Activity className="h-3 w-3" />{t('dashboard.quickActions.status.active')}</Badge>
        case 'development':
            return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />{t('dashboard.quickActions.status.development')}</Badge>
        case 'completed':
            return <Badge variant="outline" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />{t('dashboard.quickActions.status.completed')}</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

export function QuickActions() {
    const { t } = useTranslation()
    const handleQuickAction = (action: string) => {
        showInfo(t('dashboard.quickActions.actionTriggeredSuccess', { action }), t('dashboard.quickActions.actionTriggered'))
    }

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card-hover">
                <CardHeader>
                    <CardTitle className="cyber-gradient-text">{t('dashboard.quickActions.title')}</CardTitle>
                    <CardDescription className="text-gray-400">{t('dashboard.quickActions.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action) => (
                            <Button
                                key={action.id}
                                variant={action.variant}
                                className={`h-auto p-4 flex flex-col items-start space-y-2 transition-all duration-300 hover:scale-105 glass-card ${action.variant === 'default' ? 'cyber-button' : ''
                                    }`}
                                onClick={() => handleQuickAction(action.action)}
                            >
                                <div className="p-2 rounded-lg bg-cyan-500/20 neon-glow">
                                    <action.icon className="h-6 w-6 text-cyan-400" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-sm text-white">{action.title}</div>
                                    <div className="text-xs text-gray-400">{action.description}</div>
                                </div>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="glass-card-hover">
                <CardHeader>
                    <CardTitle className="purple-gradient-text">{t('dashboard.quickActions.recentProjects')}</CardTitle>
                    <CardDescription className="text-gray-400">{t('dashboard.quickActions.recentProjectsDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentProjects.map((project) => (
                            <div
                                key={project.id}
                                className="flex items-center justify-between p-4 rounded-lg glass-card hover:bg-white/5 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer data-glow"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center neon-glow">
                                        <FolderOpen className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{project.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {t('dashboard.quickActions.updated')} {project.lastUpdated}
                                        </p>
                                    </div>
                                </div>
                                {getStatusBadge(project.status)}
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-4 cyber-button text-black font-bold">
                        {t('dashboard.quickActions.viewAllProjects')}
                    </Button>
                </CardContent>
            </Card>

            {/* System Status */}
            <Card className="glass-card-hover">
                <CardHeader>
                    <CardTitle className="pink-gradient-text">{t('dashboard.quickActions.systemStatus')}</CardTitle>
                    <CardDescription className="text-gray-400">{t('dashboard.quickActions.currentSystemHealth')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-green-500/30">
                            <span className="text-sm font-medium text-white">{t('dashboard.quickActions.apiStatus')}</span>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                {t('dashboard.quickActions.operational')}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-green-500/30">
                            <span className="text-sm font-medium text-white">{t('dashboard.quickActions.database')}</span>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                {t('dashboard.quickActions.healthy')}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-green-500/30">
                            <span className="text-sm font-medium text-white">{t('dashboard.quickActions.cdn')}</span>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                {t('dashboard.quickActions.online')}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-cyan-500/30">
                            <span className="text-sm font-medium text-white">{t('dashboard.quickActions.uptime')}</span>
                            <span className="text-sm font-bold cyber-gradient-text">99.9%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 