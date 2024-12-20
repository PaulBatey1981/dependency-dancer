const LoadingSpinner = () => {
  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading schedule...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;