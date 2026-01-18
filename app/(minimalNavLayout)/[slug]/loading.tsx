const Loading = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
      </div>
    </div>
  );
};

export default Loading;
