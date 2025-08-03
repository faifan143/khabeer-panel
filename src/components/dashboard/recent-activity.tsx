'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    FolderOpen,
    Edit,
    Rocket,
    GitMerge,
    UserPlus,
    Activity
} from 'lucide-react'

// Mock data - replace with actual API calls
const mockActivities = [
    {
        id: 1,
        user: {
            name: 'John Doe',
            email: 'john@example.com',
            avatar: '/avatars/01.png',
        },
        action: 'created a new project',
        target: 'E-commerce Platform',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        type: 'project',
    },
    {
        id: 2,
        user: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            avatar: '/avatars/02.png',
        },
        action: 'updated the dashboard',
        target: 'Analytics Module',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        type: 'update',
    },
    {
        id: 3,
        user: {
            name: 'Mike Johnson',
            email: 'mike@example.com',
            avatar: '/avatars/03.png',
        },
        action: 'deployed to production',
        target: 'v2.1.0',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        type: 'deploy',
    },
    {
        id: 4,
        user: {
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            avatar: '/avatars/04.png',
        },
        action: 'merged pull request',
        target: '#123 - Feature: User Authentication',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        type: 'merge',
    },
    {
        id: 5,
        user: {
            name: 'Alex Brown',
            email: 'alex@example.com',
            avatar: '/avatars/05.png',
        },
        action: 'added new user',
        target: 'emma@example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        type: 'user',
    },
]

const fetchActivities = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockActivities
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'project':
            return <FolderOpen className="h-4 w-4" />
        case 'update':
            return <Edit className="h-4 w-4" />
        case 'deploy':
            return <Rocket className="h-4 w-4" />
        case 'merge':
            return <GitMerge className="h-4 w-4" />
        case 'user':
            return <UserPlus className="h-4 w-4" />
        default:
            return <Activity className="h-4 w-4" />
    }
}

const getActivityColor = (type: string) => {
    switch (type) {
        case 'project':
            return 'bg-blue-100 text-blue-800'
        case 'update':
            return 'bg-yellow-100 text-yellow-800'
        case 'deploy':
            return 'bg-green-100 text-green-800'
        case 'merge':
            return 'bg-purple-100 text-purple-800'
        case 'user':
            return 'bg-orange-100 text-orange-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
}

export function RecentActivity() {
    const { data: activities, isLoading, error } = useQuery({
        queryKey: ['recent-activities'],
        queryFn: fetchActivities,
    })

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates from your team</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted animate-pulse rounded" />
                                    <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates from your team</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">Failed to load recent activities</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="glass-card-hover">
            <CardHeader>
                <CardTitle className="cyber-gradient-text">Recent Activity</CardTitle>
                <CardDescription className="text-gray-400">Latest updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities?.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg glass-card hover:bg-white/5 transition-all duration-300 data-glow">
                            <Avatar className="h-10 w-10 border-2 border-cyan-500/30 neon-glow">
                                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                                <AvatarFallback className="bg-cyan-500/20 text-cyan-400 font-medium">
                                    {activity.user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium leading-none text-white">
                                        {activity.user.name}
                                    </p>
                                    <div className="p-1 rounded-md bg-cyan-500/20 neon-glow">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400">
                                    {activity.action} <span className="font-medium text-white">{activity.target}</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatTimeAgo(activity.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
} 