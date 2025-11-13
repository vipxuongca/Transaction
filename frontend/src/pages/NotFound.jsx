import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-amber-100 text-center p-6">
      <h1 className="text-6xl font-bold mb-4 text-amber-400">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Trang không tồn tại</h2>
      <p className="text-gray-300 mb-6 max-w-md">
        Có vẻ như bạn đã đi lạc. Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link
        to="/"
        className="bg-amber-500 hover:bg-amber-600 text-neutral-900 font-semibold py-2 px-6 rounded-lg transition"
      >
        Quay lại Trang Chủ
      </Link>
    </div>
  );
};

export default NotFound;
