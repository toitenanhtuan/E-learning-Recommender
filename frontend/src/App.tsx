import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; // Component để bảo vệ route

// Import Pages
import HomePage from './pages/HomePage';
import CourseDetailPage from './pages/CourseDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SurveyPage from './pages/SurveyPage';
import DashboardPage from './pages/DashboardPage';

function App() {
    return (
        <Router>
            {/* 
                AuthProvider nằm ở file index.tsx để bao bọc toàn bộ App,
                đảm bảo mọi component trong App đều có thể truy cập auth context.
            */}
            <div className="App bg-gray-50 min-h-screen">
                <Navbar />
                <main>
                    <Routes>
                        {/* === CÁC ROUTE CÔNG KHAI (AI CŨNG XEM ĐƯỢC) === */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />


                        {/* === CÁC ROUTE ĐƯỢC BẢO VỆ (YÊU CẦU ĐĂNG NHẬP) === */}

                        {/* Route cho trang khảo sát */}
                        <Route
                            path="/survey"
                            element={
                                <ProtectedRoute>
                                    <SurveyPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Route cho trang Bảng điều khiển/Lộ trình cá nhân */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* 
                            Thêm các trang được bảo vệ khác ở đây, ví dụ: /profile 
                            <Route 
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />
                        */}

                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;