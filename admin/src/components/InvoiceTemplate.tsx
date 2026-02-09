import type { Order } from "@/lib/types";

const InvoiceTemplate = ({ invoice }: {invoice: Order}) => {
  return (
    <div className="bg-white p-8 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">BabyShop</h1>
          <p className="text-slate-600 text-sm mt-1">
            Professional Baby Products Store
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">
            Invoice #{invoice.orderId}
          </p>
          <p className="text-sm text-slate-600">
            {new Date(invoice.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Customer & Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            BILL TO:
          </h3>
          <p className="font-medium text-slate-900">{invoice.user.name}</p>
          <p className="text-sm text-slate-600">{invoice.user.email}</p>
          <p className="text-sm text-slate-600 mt-2">
            {invoice.shippingAddress.street}
          </p>
          <p className="text-sm text-slate-600">
            {invoice.shippingAddress.city}, {invoice.shippingAddress.state}{" "}
            {invoice.shippingAddress.zipCode}
          </p>
          <p className="text-sm text-slate-600">
            {invoice.shippingAddress.country}
          </p>
        </div>

        <div className="text-right">
          <div className="mb-4">
            <p className="text-sm text-slate-600">Invoice Date</p>
            <p className="font-semibold text-slate-900">
              {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Payment Status</p>
            <p
              className={`font-semibold ${
                invoice.paymentStatus === "paid"
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {invoice.paymentStatus.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-300">
              <th className="text-left py-3 px-4 font-semibold text-slate-900">
                Item
              </th>
              <th className="text-center py-3 px-4 font-semibold text-slate-900">
                Qty
              </th>
              <th className="text-right py-3 px-4 font-semibold text-slate-900">
                Unit Price
              </th>
              <th className="text-right py-3 px-4 font-semibold text-slate-900">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-slate-200">
                <td className="py-3 px-4 text-slate-900">{item.product.name}</td>
                <td className="py-3 px-4 text-center text-slate-900">
                  {item.quantity}
                </td>
                <td className="py-3 px-4 text-right text-slate-900">
                  ${item.price.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right text-slate-900 font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600">Subtotal:</span>
            <span className="text-slate-900 font-medium">
              ${invoice.totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600">Tax (0%):</span>
            <span className="text-slate-900 font-medium">$0.00</span>
          </div>
          <div className="flex justify-between py-3 bg-blue-50 px-4 rounded-lg">
            <span className="font-semibold text-slate-900">Total:</span>
            <span className="text-xl font-bold text-blue-600">
              ${invoice.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-slate-200 pt-6 text-center text-sm text-slate-600">
        <p>Thank you for your business!</p>
        <p className="mt-2">
          For inquiries, please contact us at support@babyshop.com
        </p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
