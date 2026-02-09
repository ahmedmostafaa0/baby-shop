import  { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Package,
  AlertTriangle,
  Download
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/config";
import { formatCurrency } from "@/lib/formatCurrency";
import { toast } from "sonner";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import AccountSkeleton from "@/components/skeletons/AccountSkeleton";
import type { AnalyticsData } from "@/lib/types";
import StatsCard from "@/components/StatsCard";


const AccountPage = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");
  const [year, setYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState("30days");

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/analytics/overview");
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!analyticsData) return;

    const workbook = XLSX.utils.book_new();

    const overviewData = [
      ["Metric", "Value"],
      ["Total Revenue", analyticsData.overview.totalRevenue],
      ["Total Orders", analyticsData.overview.totalOrders],
      ["Total Products", analyticsData.overview.totalProducts],
      ["Total Users", analyticsData.overview.totalUsers],
    ];
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

    // Best Selling Products sheet
    if (analyticsData.sales.bestSellingProducts.length > 0) {
      const productsData = [
        ["Product Name", "Total Sold", "Total Revenue"],
        ...analyticsData.sales.bestSellingProducts.map((p) => [
          p.productName,
          p.totalSold,
          p.totalRevenue,
        ]),
      ];
      const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
      XLSX.utils.book_append_sheet(workbook, productsSheet, "Best Sellers");
    }

    // Inventory Alerts sheet
    const inventoryData = [
      ["Alert Type", "Count"],
      ["Low Stock", analyticsData.inventory.lowStockCount],
      ["Out of Stock", analyticsData.inventory.outOfStockCount],
    ];
    const inventorySheet = XLSX.utils.aoa_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(workbook, inventorySheet, "Inventory");

    XLSX.writeFile(workbook, `analytics-report-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Report exported to Excel");
  };

  const handleExportPDF = () => {
    if (!analyticsData) return;

    const pdf = new jsPDF();
    let yPosition = 10;

    pdf.setFontSize(20);
    pdf.text("Analytics Report", 10, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 10, yPosition);
    yPosition += 10;

    // Overview Section
    pdf.setFontSize(14);
    pdf.text("Overview", 10, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    const overviewText = [
      `Total Revenue: ${formatCurrency(analyticsData.overview.totalRevenue)}`,
      `Total Orders: ${analyticsData.overview.totalOrders}`,
      `Total Products: ${analyticsData.overview.totalProducts}`,
      `Total Users: ${analyticsData.overview.totalUsers}`,
    ];

    overviewText.forEach((text) => {
      pdf.text(text, 10, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Inventory Section
    pdf.setFontSize(14);
    pdf.text("Inventory Status", 10, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    const inventoryText = [
      `Low Stock Products: ${analyticsData.inventory.lowStockCount}`,
      `Out of Stock Products: ${analyticsData.inventory.outOfStockCount}`,
    ];

    inventoryText.forEach((text) => {
      pdf.text(text, 10, yPosition);
      yPosition += 6;
    });

    pdf.save(`analytics-report-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Report exported to PDF");
  };

  if (loading) {
    return <AccountSkeleton />
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="text-center">
          <p className="text-slate-600">Failed to load analytics data</p>
          <Button onClick={fetchAnalyticsData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const monthlyData = analyticsData.sales.monthlyRevenue.map((item: any) => ({
    month: `${item._id.month}/${item._id.year}`,
    revenue: item.revenue,
    orders: item.orders,
  }));

  const orderStatusData = analyticsData.sales.orderStatusBreakdown.map(
    (item: any) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      revenue: item.totalValue,
    })
  );

  const bestSellingData = analyticsData.sales.bestSellingProducts
    .slice(0, 5)
    .map((item: any) => ({
      name: item.productName,
      sold: item.totalSold,
      revenue: item.totalRevenue,
    }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              Account Overview
            </h1>
            <p className="text-slate-600 mt-2">
              Complete analytics and insights for your e-commerce business
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white border-0 shadow-sm flex flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Date Range: 
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div  className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Period:
                </label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div  className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Year:
                </label>
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger className="bg-slate-50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
        </Card>
      </motion.div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={<DollarSign className="h-6 w-6 text-indigo-600" />}
          title="Total Revenue"
          value={formatCurrency(analyticsData.overview.totalRevenue)}
        />
        <StatsCard
          icon={<ShoppingBag className="h-6 w-6 text-indigo-600" />}
          title="Total Orders"
          value={analyticsData.overview.totalOrders}
        />
        <StatsCard
          icon={<Package className="h-6 w-6 text-indigo-600" />}
          title="Total Products"
          value={analyticsData.overview.totalProducts}
        />
        <StatsCard
          icon={<Users className="h-6 w-6 text-indigo-600" />}
          title="Total Users"
          value={analyticsData.overview.totalUsers}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Monthly Revenue</h2>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Order Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Order Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Best Selling Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Best Selling Products
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bestSellingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="sold" fill="#3b82f6" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="p-6 bg-white border-0 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {analyticsData.sales.recentOrders.slice(0, 5).map((order: any) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {order.userId?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(order.total)}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        order.status === "paid" || order.status === "completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Low Stock Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Low Stock Products</h2>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="space-y-2">
              {analyticsData.inventory.lowStockProducts.slice(0, 5).map((product: any) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Stock: {product.stock} units
                    </p>
                  </div>
                  <p className="text-sm font-bold text-yellow-600">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              ))}
              {analyticsData.inventory.lowStockProducts.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No low stock products
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Out of Stock Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Out of Stock</h2>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="space-y-2">
              {analyticsData.inventory.outOfStockProducts.slice(0, 5).map((product: any) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">Out of Stock</p>
                  </div>
                  <p className="text-sm font-bold text-red-600">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              ))}
              {analyticsData.inventory.outOfStockProducts.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No out of stock products
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card className="p-6 bg-white border-0 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Inventory Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-blue-600">
                {analyticsData.overview.totalProducts}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {analyticsData.inventory.lowStockCount}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {analyticsData.inventory.outOfStockCount}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {analyticsData.overview.totalProducts -
                  analyticsData.inventory.lowStockCount -
                  analyticsData.inventory.outOfStockCount}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// Helper component for DollarSign icon
const DollarSign = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default AccountPage;
