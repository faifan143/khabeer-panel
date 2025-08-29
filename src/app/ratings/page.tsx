"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminRatings } from "@/lib/api/hooks/useAdmin"
import { formatCurrency } from "@/lib/utils"
import {
    Eye,
    Search,
    Star,
    ThumbsUp,
    ThumbsDown,
    TrendingUp,
    Award
} from "lucide-react"
import { useState, useMemo } from "react"

export default function RatingsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [ratingFilter, setRatingFilter] = useState<string>("all")
    const [selectedRating, setSelectedRating] = useState<any>(null)

    // Fetch ratings data
    const { data: ratings = [], isLoading } = useAdminRatings()

    // Calculate statistics
    const stats = useMemo(() => {
        if (!ratings.length) {
            return {
                total: 0,
                average: "0.0",
                fiveStar: 0,
                reported: 0,
                verified: 0,
                percentage: "0.0"
            }
        }

        const totalRatings = ratings.length
        const averageRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
        const fiveStarRatings = ratings.filter(r => r.rating === 5).length
        const verifiedRatings = ratings.filter(r => r.orderId).length // Ratings with orderId are verified

        return {
            total: totalRatings,
            average: averageRating.toFixed(1),
            fiveStar: fiveStarRatings,
            reported: 0, // Not implemented in backend yet
            verified: verifiedRatings,
            percentage: ((fiveStarRatings / totalRatings) * 100).toFixed(1)
        }
    }, [ratings])

    // Filter ratings
    const filteredRatings = useMemo(() => {
        return ratings.filter(rating => {
            const matchesSearch =
                rating.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rating.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rating.order?.service?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                rating.comment?.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesRating = ratingFilter === "all" ||
                (ratingFilter === "5" && rating.rating === 5) ||
                (ratingFilter === "4" && rating.rating === 4) ||
                (ratingFilter === "3" && rating.rating === 3) ||
                (ratingFilter === "2" && rating.rating === 2) ||
                (ratingFilter === "1" && rating.rating === 1)

            return matchesSearch && matchesRating
        })
    }, [ratings, searchQuery, ratingFilter])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
            />
        ))
    }

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return "text-green-600"
        if (rating >= 3) return "text-yellow-600"
        return "text-red-600"
    }

    if (isLoading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                            <div className="text-sm text-muted-foreground">Loading ratings...</div>
                        </div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    All time reviews
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.average}</div>
                                <div className="flex items-center space-x-1">
                                    {renderStars(Math.round(parseFloat(stats.average)))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">5-Star Ratings</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.fiveStar}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.percentage}% of total
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Verified Reviews</CardTitle>
                                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.verified}</div>
                                <p className="text-xs text-muted-foreground">
                                    Confirmed purchases
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Reported Reviews</CardTitle>
                                <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.reported}</div>
                                <p className="text-xs text-muted-foreground">
                                    Needs attention
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Ratings Table */}
                    <Card>
                        <CardHeader className="flex items-center justify-between">
                            <div>
                                <CardTitle>All Ratings ({filteredRatings.length})</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Manage and monitor all customer reviews and ratings
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search ratings..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 w-80"
                                    />
                                </div>

                                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Ratings</SelectItem>
                                        <SelectItem value="5">5 Stars</SelectItem>
                                        <SelectItem value="4">4 Stars</SelectItem>
                                        <SelectItem value="3">3 Stars</SelectItem>
                                        <SelectItem value="2">2 Stars</SelectItem>
                                        <SelectItem value="1">1 Star</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold">Customer</TableHead>
                                            <TableHead className="font-semibold">Provider</TableHead>
                                            <TableHead className="font-semibold">Service</TableHead>
                                            <TableHead className="font-semibold">Rating</TableHead>
                                            <TableHead className="font-semibold">Comment</TableHead>
                                            <TableHead className="font-semibold">Date</TableHead>
                                            <TableHead className="font-semibold text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRatings.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8">
                                                    <div className="text-muted-foreground">
                                                        {searchQuery || ratingFilter !== "all"
                                                            ? "No ratings found matching your criteria"
                                                            : "No ratings available"
                                                        }
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredRatings.map((rating) => (
                                                <TableRow key={rating.id} className="hover:bg-gray-50/50">
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={process.env.NEXT_PUBLIC_API_URL_IMAGE + rating.user?.image} alt={rating.user?.name} />
                                                                <AvatarFallback>{getInitials(rating.user?.name || "U")}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{rating.user?.name || "Unknown"}</div>
                                                                <div className="text-sm text-muted-foreground">{rating.user?.phone || "N/A"}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={process.env.NEXT_PUBLIC_API_URL_IMAGE + rating.provider?.image} alt={rating.provider?.name} />
                                                                <AvatarFallback>{getInitials(rating.provider?.name || "P")}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{rating.provider?.name || "Unknown"}</div>
                                                                <div className="text-sm text-muted-foreground">{rating.provider?.email || "N/A"}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{rating.order?.service?.title || "N/A"}</div>
                                                            <div className="text-sm text-muted-foreground">{rating.order?.service?.category?.titleEn || "N/A"}-{rating.order?.service?.category?.titleAr || "N/A"}</div>
                                                            {rating.order?.bookingId && (
                                                                <div className="text-xs text-muted-foreground">#{rating.order.bookingId}</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`font-bold text-lg ${getRatingColor(rating.rating)}`}>
                                                                {rating.rating}/5
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-xs">
                                                            <p className="text-sm line-clamp-2">{rating.comment || "No comment"}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{formatDate(rating.ratingDate)}</div>
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setSelectedRating(rating)}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-2xl">
                                                                <DialogHeader>
                                                                    <DialogTitle>Rating Details</DialogTitle>
                                                                    <DialogDescription>
                                                                        Detailed view of the rating and related information
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                {selectedRating && (
                                                                    <div className="space-y-6">
                                                                        {/* Rating Header */}
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center space-x-3">
                                                                                <Avatar className="h-12 w-12">
                                                                                    <AvatarImage src={process.env.NEXT_PUBLIC_API_URL_IMAGE + selectedRating.user?.image} alt={selectedRating.user?.name} />
                                                                                    <AvatarFallback>{getInitials(selectedRating.user?.name || "U")}</AvatarFallback>
                                                                                </Avatar>
                                                                                <div>
                                                                                    <div className="font-medium">{selectedRating.user?.name || "Unknown"}</div>
                                                                                    <div className="text-sm text-muted-foreground">{selectedRating.user?.phone || "N/A"}</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="flex items-center space-x-1">
                                                                                    {renderStars(selectedRating.rating)}
                                                                                </div>
                                                                                <div className={`font-medium ${getRatingColor(selectedRating.rating)}`}>
                                                                                    {selectedRating.rating}/5
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Service Information */}
                                                                        {selectedRating.order && (
                                                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                                                <h4 className="font-medium mb-2">Service Information</h4>
                                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                                    <div>
                                                                                        <span className="text-muted-foreground">Provider:</span>
                                                                                        <div className="font-medium">{selectedRating.provider?.name || "N/A"}</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-muted-foreground">Service:</span>
                                                                                        <div className="font-medium">{selectedRating.order.service?.title || "N/A"}</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-muted-foreground">Category:</span>
                                                                                        <div className="font-medium">{selectedRating.order.service?.category?.titleEn || "N/A"}</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-muted-foreground">Order Amount:</span>
                                                                                        <div className="font-medium">{formatCurrency(selectedRating.order.totalAmount || 0)}</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-muted-foreground">Order ID:</span>
                                                                                        <div className="font-medium">#{selectedRating.order.id}</div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <span className="text-muted-foreground">Rating Date:</span>
                                                                                        <div className="font-medium">{formatDate(selectedRating.ratingDate)}</div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Comment */}
                                                                        <div>
                                                                            <h4 className="font-medium mb-2">Customer Comment</h4>
                                                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                                                <p className="text-sm">{selectedRating.comment || "No comment provided"}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </DialogContent>
                                                        </Dialog>
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