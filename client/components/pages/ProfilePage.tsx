"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import {
  User,
  ShoppingCart,
  Package,
  Save,
  MapPin,
  Plus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { useCartStore } from "@/hooks/useCart";
import api from "@/lib/config";

const updateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 8,
      "Password must be at least 8 characters or empty",
    ),
});

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  isDefault: z.boolean(),
});

type FormData = z.infer<typeof updateSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [editingAddress, setEditingAddress] = useState<AddressFormData | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { logout, user } = useAuth();
  const { items } = useCartStore();

  const updateForm = useForm<FormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: user?.name || "",
      password: "",
    },
  });

  // Update form defaults when authUser changes
  useEffect(() => {
    if (user) {
      console.log("Initializing updateForm with name:", user.name);
      updateForm.reset({
        name: user.name,
        password: "",
      });
    }
  }, [user, updateForm]);

  const addressForm = useForm<AddressFormData, AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      city: "",
      country: "",
      postalCode: "",
      isDefault: false,
    },
  });

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoading(true);
    try {
      logout();
      toast.success("You have been logged out successfully.");
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description:
          error instanceof Error ? error.message : "Failed to log out.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
    }
    setIsLoading(false);
    setIsLogoutModalOpen(false);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        Please sign in to view your profile.
      </div>
    );
  }

  const onUpdateSubmit = async (updateData: FormData) => {
    setIsLoading(true);
    try {
      const { data } = await api.put(`/users/${user._id}`, updateData);
      if (data.success) {
        toast.success("Profile updated", {
          description: "Your profile has been updated successfully.",
          className: "bg-green-50 text-gray-800 border-green-200",
          duration: 5000,
        });
        updateForm.reset({ name: data.name, password: "" });
      } else {
        throw new Error(data.error?.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Update failed", {
        description:
          error instanceof Error ? error.message : "Failed to update profile.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
    }
    setIsLoading(false);
  };

  const onAddressSubmit = async (data: AddressFormData) => {
    setIsLoading(true);

    try {
      const response = await api.post(`/users/${user._id}/addresses`, data);
      if (response.data.success && response.data) {
        toast.success("Address saved", {
          description: editingAddress
            ? "Address updated successfully."
            : "Address added successfully.",
          className: "bg-green-50 text-gray-800 border-green-200",
          duration: 5000,
        });
        setIsAddressModalOpen(false);
        addressForm.reset();
        setEditingAddress(null);
        setSelectedAddressId(null);
      } else {
        throw new Error(
          response.data.error?.message || "Failed to save address.",
        );
      }
    } catch (error) {
      console.error("Address save error:", error);
      toast.error("Address save failed", {
        description:
          error instanceof Error ? error.message : "Failed to save address.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
    }
    setIsLoading(false);
  };

  const handleEditAddress = (address: AddressFormData, index: number) => {
    console.log("Editing address:", address, "Index:", index);
    setEditingAddress(address);
    setSelectedAddressId(index.toString());
    addressForm.reset(address);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async () => {
    if (selectedAddressId === null) return;
    setIsLoading(true);
    try {
      const response = await api.delete(`/users/${user._id}/addresses/${selectedAddressId}`);
      if (response.data.success && response.data) {
        toast.success("Address deleted", {
          description: "Address removed successfully.",
          className: "bg-green-50 text-gray-800 border-green-200",
          duration: 5000,
        });
        setIsDeleteModalOpen(false);
        setSelectedAddressId(null);
      } else {
        throw new Error(
          response.data.error?.message || "Failed to delete address.",
        );
      }
    } catch (error) {
      console.error("Address delete error:", error);
      toast.error("Address deletion failed", {
        description:
          error instanceof Error ? error.message : "Failed to delete address.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
    }
    setIsLoading(false);
  };

  console.log(items)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        {/* User Information */}
        <Card className="shadow-md mb-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-2xl font-bold text-gray-900">
              <div className="flex items-center gap-2">
                <User className="h-6 w-6 text-indigo-600" />
                User Information
              </div>
              <Button onClick={handleLogout} disabled={isLoading}>
                <LogOut className="h-5 w-5 mr-2" /> Log Out
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Name</p>
                <p className="text-lg text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-lg capitalize text-gray-900">{user.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avatar</p>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card className="shadow-md mb-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-2xl font-bold text-gray-900">
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-indigo-600" />
                Addresses
              </div>
              <Button
                onClick={() => {
                  addressForm.reset();
                  setEditingAddress(null);
                  setSelectedAddressId(null);
                  setIsAddressModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-5 w-5 mr-2" /> Add Address
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!(user.addresses && user.addresses.length > 0) ? (
              <p className="text-center text-gray-500">No addresses added.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Street</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Postal Code</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.addresses.map((address, index) => (
                    <TableRow key={index}>
                      <TableCell>{address.street}</TableCell>
                      <TableCell>{address.city}</TableCell>
                      <TableCell>{address.country}</TableCell>
                      <TableCell>{address.postalCode}</TableCell>
                      <TableCell>{address.isDefault ? "Yes" : "No"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAddress(address, index)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedAddressId(address._id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Update Form */}
        <Card className="shadow-md mb-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Save className="h-6 w-6 text-indigo-600" />
              Update Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...updateForm}>
              <form
                onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
                className="flex flex-col gap-6"
              >
                <FormField
                  control={updateForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Password (leave empty to keep current)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                            placeholder="Enter new password"
                            disabled={isLoading}
                            className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-indigo-600"
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 font-semibold rounded-lg shadow-md"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Cart Items */}
        <Card className="shadow-md mb-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <ShoppingCart className="h-6 w-6 text-indigo-600" />
              Cart
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items?.length === 0 ? (
              <p className="text-center text-gray-500">Your cart is empty.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map((item) => (
                    <TableRow key={item?._id}>
                      <TableCell className="flex items-center gap-2">
                        {item.productId.image && (
                          <img
                            src={item.productId.image[0]}
                            alt={item.productId.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        )}
                        {item.productId.name.slice(0,30)}...
                      </TableCell>
                      <TableCell>${item.productId.price?.toFixed(2)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        ${(item.productId.price * (item.quantity ?? 1)).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="shadow-md mb-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Package className="h-6 w-6 text-indigo-600" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={"/user/orders"}>
              <Button variant={"outline"}>View all orders</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Address Dialog */}
        <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
          <DialogContent className="sm:max-w-[550px] bg-white rounded-xl shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {editingAddress ? "Edit Address" : "Add Address"}
              </DialogTitle>
            </DialogHeader>
            <Form<AddressFormData> {...addressForm}>
              <form
                onSubmit={addressForm.handleSubmit(onAddressSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={addressForm.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Street
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        City
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Country
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Postal Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="border-gray-300 data-[state=checked]:bg-indigo-600"
                        />
                      </FormControl>
                      <FormLabel className="text-gray-700 font-medium">
                        Set as default address
                      </FormLabel>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddressModalOpen(false)}
                    disabled={isLoading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Saving...
                      </span>
                    ) : editingAddress ? (
                      "Update Address"
                    ) : (
                      "Add Address"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Address Dialog */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white rounded-xl shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Delete Address
              </DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">
              Are you sure you want to delete this address? This action cannot
              be undone.
            </p>
            <DialogFooter className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteAddress}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logout Confirmation Dialog */}
        <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
          <DialogContent className="max-w-2xl bg-white rounded-xl shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Confirm Logout
              </DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">
              Are you sure you want to log out? You will need to sign in again
              to access your profile.
            </p>
            <DialogFooter className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLogoutModalOpen(false)}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmLogout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Logging out...
                  </span>
                ) : (
                  "Log Out"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
