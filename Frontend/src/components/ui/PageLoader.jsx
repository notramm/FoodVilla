import Spinner from "./Spinner.jsx";

const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
          <span className="text-white text-xl">🍽️</span>
        </div>
        <Spinner size="md" color="primary" />
        <p className="text-sm text-gray-500">Loading GoodFoods...</p>
      </div>
    </div>
  );
};

export default PageLoader;