const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-sm h-[400px]">
      <p className="font-medium text-lg text-indigo-500">404 Error</p>
      <h2 className="md:text-6xl text-4xl font-semibold text-gray-800">
        Page Not Found
      </h2>
      <p className="text-base mt-4 text-gray-500">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
    </div>
  );
};

export default NotFound;
