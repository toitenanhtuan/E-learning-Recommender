import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Định nghĩa props rõ ràng
interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, token } = useAuth(); // Có thể lấy thêm token để kiểm tra

    // Thêm một bước kiểm tra trạng thái tải token
    // Đôi khi, lúc đầu `isAuthenticated` có thể là false trong khi token đang được load từ localStorage
    // Cách đơn giản nhất là kiểm tra trực tiếp token
    const isLoading = token === undefined; // Giả sử undefined là trạng thái ban đầu

    if (isLoading) {
        return <div>Loading authentication...</div>; // Trả về màn hình chờ
    }

    if (!isAuthenticated) {
        // Chuyển hướng về trang login nếu chưa đăng nhập
        return <Navigate to="/login" replace />;
    }

    // Nếu đã đăng nhập, render các component con được truyền vào
    return <>{children}</>; // <-- DÒNG BỊ THIẾU. Có thể dùng return children;
};

export default ProtectedRoute;