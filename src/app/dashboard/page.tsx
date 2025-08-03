import { AdminLayout } from "@/components/layout/admin-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Package, Calendar, DollarSign, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to Khabeer Admin Panel. Here's an overview of your platform.
            </p>
          </div>

          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Providers</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">567</div>
                <p className="text-xs text-muted-foreground">
                  +12.3% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Orders</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,901</div>
                <p className="text-xs text-muted-foreground">
                  +15.7% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Khabeer Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,340</div>
                <p className="text-xs text-muted-foreground">
                  +8.9% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Providers Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,678</div>
                <p className="text-xs text-muted-foreground">
                  +12.4% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Services Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Top Services</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Show All
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {[
                { name: "Cleaning", orders: 234, icon: "🧹" },
                { name: "Plumbing", orders: 189, icon: "🔧" },
                { name: "Painting", orders: 156, icon: "🎨" },
                { name: "Delivery", orders: 123, icon: "📦" },
                { name: "Moving", orders: 98, icon: "🚚" },
              ].map((service) => (
                <Card key={service.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{service.icon}</div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.orders} orders</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Top Providers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Top Providers</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Show All
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {[
                { name: "Ahmed Hassan", orders: 89, rating: 4.8, icon: "👨‍🔧" },
                { name: "Sarah Ali", orders: 76, rating: 4.9, icon: "👩‍🎨" },
                { name: "Ali Mohammed", orders: 65, rating: 4.7, icon: "👨‍🚚" },
                { name: "Fatima Ahmed", orders: 54, rating: 4.6, icon: "👩‍💼" },
                { name: "Omar Khalil", orders: 43, rating: 4.5, icon: "👨‍🔧" },
              ].map((provider) => (
                <Card key={provider.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{provider.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{provider.name}</p>
                        <p className="text-sm text-muted-foreground">{provider.orders} orders</p>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-xs">{provider.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
                 </div>
       </AdminLayout>
     </ProtectedRoute>
   )
 }
