'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { showInfo } from '@/lib/utils/toast'
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
        title: 'Create Project',
        description: 'Start a new project',
        icon: FolderPlus,
        action: 'Create Project',
        variant: 'default' as const,
    },
    {
        id: 2,
        title: 'Add User',
        description: 'Invite team member',
        icon: UserPlus,
        action: 'Add User',
        variant: 'secondary' as const,
    },
    {
        id: 3,
        title: 'Generate Report',
        description: 'Create analytics report',
        icon: BarChart3,
        action: 'Generate Report',
        variant: 'outline' as const,
    },
    {
        id: 4,
        title: 'Deploy',
        description: 'Deploy to production',
        icon: Rocket,
        action: 'Deploy',
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
            return <Badge variant="default" className="flex items-center gap-1"><Activity className="h-3 w-3" />Active</Badge>
        case 'development':
            return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Development</Badge>
        case 'completed':
            return <Badge variant="outline" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Completed</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

export function QuickActions() {
    const handleQuickAction = (action: string) => {
        showInfo(`${action} action has been triggered successfully!`, 'Action Triggered')
    }

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card-hover">
                <CardHeader>
                    <CardTitle className="cyber-gradient-text">Quick Actions</CardTitle>
                    <CardDescription className="text-gray-400">Common tasks and shortcuts</CardDescription>
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
                    <CardTitle className="purple-gradient-text">Recent Projects</CardTitle>
                    <CardDescription className="text-gray-400">Your recently accessed projects</CardDescription>
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
                                            Updated {project.lastUpdated}
                                        </p>
                                    </div>
                                </div>
                                {getStatusBadge(project.status)}
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-4 cyber-button text-black font-bold">
                        View All Projects
                    </Button>
                </CardContent>
            </Card>

            {/* System Status */}
            <Card className="glass-card-hover">
                <CardHeader>
                    <CardTitle className="pink-gradient-text">System Status</CardTitle>
                    <CardDescription className="text-gray-400">Current system health</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-green-500/30">
                            <span className="text-sm font-medium text-white">API Status</span>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Operational
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-green-500/30">
                            <span className="text-sm font-medium text-white">Database</span>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Healthy
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-green-500/30">
                            <span className="text-sm font-medium text-white">CDN</span>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Online
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg glass-card border border-cyan-500/30">
                            <span className="text-sm font-medium text-white">Uptime</span>
                            <span className="text-sm font-bold cyber-gradient-text">99.9%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 