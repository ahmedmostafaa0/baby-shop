const AdminAccess = () => {
  return <div className="h-screen flex flex-col items-center justify-center text-sm">
      <p className="font-semibold text-lg text-red-500">Access Denied</p>

      <h2 className="md:text-6xl text-4xl font-bold text-gray-800 mt-2">
        Admins Only
      </h2>

      <p className="text-base mt-4 text-gray-500 text-center max-w-md">
        You do not have permission to access this page. This area is restricted to
        administrators only.
      </p>

      <div className="mt-8 flex gap-4">
        <a
          href="/login"
          className="px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Login as Admin
        </a>
      </div>
    </div>;
};

export default AdminAccess;
