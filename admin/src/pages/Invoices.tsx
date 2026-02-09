import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  FileTextIcon,
  Download,
  ChevronRight,
  ChevronLeft,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card } from "@/components/ui/card";
import { api } from "@/lib/config";
import { formatCurrency } from "@/lib/formatCurrency";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import InvoiceSkeleton from "@/components/skeletons/InvoiceSkeleton";
import type { Order } from "@/lib/types";
import StatsCard from "@/components/StatsCard";
import InvoiceTemplate from "@/components/InvoiceTemplate";

const Invoices = () => {
  const [invoices, setInvoices] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders/admin", {
        params: { page, perPage, sortOrder },
      });
      setInvoices(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const mathedSearch =
      invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchedStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    const matchedPayment =
      paymentFilter === "all" || invoice.paymentStatus === paymentFilter;

    return mathedSearch && matchedStatus && matchedPayment;
  });

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handleSortChange = (newSortOrder: 'asc' | 'desc') => {
    setPage(1)
    setSortOrder(newSortOrder)
  }

  const generatePDF = async (invoice: Order) => {
    try {
      const element = document.getElementById(`invoice-${invoice._id}`);
      if (!element) {
        toast.error("Invoice template not found");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",

        onclone: (doc) => {
          const all = doc.querySelectorAll<HTMLElement>("*");

          all.forEach((el) => {
            const style = getComputedStyle(el);

            if (style.color.includes("oklch")) {
              el.style.color = "#000000";
            }

            if (style.backgroundColor.includes("oklch")) {
              el.style.backgroundColor = "#ffffff";
            }

            if (style.borderColor.includes("oklch")) {
              el.style.borderColor = "#e5e7eb";
            }
          });
        },
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`${invoice.orderId}.pdf`);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter, paymentFilter, sortOrder]);

  if (loading) {
    return <InvoiceSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Invoice Generator
            </h1>
            <p className="text-slate-600 mt-2">
              Generate and manage invoices for your orders
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Invoices"
            value={invoices.length}
            icon={<FileText className="w-8 h-8 text-blue-500 opacity-20" />}
          />
          <StatsCard
            title="Paid"
            value={invoices.filter((i) => i.paymentStatus === "paid").length}
            icon={<CheckCircle className="w-8 h-8 text-green-500 opacity-20" />}
          />
          <StatsCard
            title="Pending"
            value={invoices.filter((i) => i.paymentStatus === "pending").length}
            icon={<Clock className="w-8 h-8 text-yellow-500 opacity-20" />}
          />
          <StatsCard
            title="Total revenue"
            value={formatCurrency(
              invoices.reduce((sum, i) => sum + i.totalAmount, 0),
            )}
            icon={<DollarSign className="w-8 h-8 text-blue-500 opacity-20" />}
          />
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white border-0 shadow-sm mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative md:w-sm">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by Order ID, Customer, or Email..."
                className="pl-10 bg-slate-50 border-slate-200"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Filter by Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger
                className="w-40 bg-background text-sm shadow-sm hover:bg-muted/10 focus:ring-2 focus:ring-ring"
                aria-label="Sort order"
              >
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc" className="flex items-center">
                  <span className="flex items-center">
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Ascending
                  </span>
                </SelectItem>
                <SelectItem value="desc" className="flex items-center">
                  <span className="flex items-center">
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Descending
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </motion.div>

      {/* Invoices Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm border overflow-hidden mb-4"
      >
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                Order ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                Payment
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-12 h-12 text-slate-300" />
                    <p className="text-slate-500">No invoices found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {invoice.orderId}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">
                        {invoice.user.name}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {invoice.user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {invoice.paymentStatus.charAt(0).toUpperCase() +
                        invoice.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        invoice.status,
                      )}`}
                    >
                      {invoice.status.charAt(0).toUpperCase() +
                        invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button
                      variant="default"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowPreview(true);
                      }}
                      title="Preview"
                    >
                      <FileTextIcon className="w-4 h-4" />
                      Generate
                    </Button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Invoice Preview Modal */}
      {selectedInvoice && showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Invoice Preview
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </Button>
            </div>

            <div
              id={`invoice-${selectedInvoice._id}`}
              className="p-8 bg-white text-black"
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
            >
              <InvoiceTemplate invoice={selectedInvoice} />
            </div>

            <div className="border-t border-slate-200 px-6 py-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  generatePDF(selectedInvoice);
                  setShowPreview(false);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pagination Controls */}
      {total > 0 && total > perPage && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * perPage + 1} to{" "}
            {Math.min(page * perPage, total)} of {total} categories
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Simple pagination for single page */}
      {total > 0 && total <= perPage && (
        <div className="text-center text-sm text-muted-foreground bg-card rounded-lg border border-border/50 px-4 py-3">
          Showing all <span className="font-medium">{total}</span> products
        </div>
      )}
    </div>
  );
};

export default Invoices;
