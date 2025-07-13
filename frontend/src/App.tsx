import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import CourseDetailPage from './pages/CourseDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SurveyPage from './pages/SurveyPage';
import DashboardPage from './pages/DashboardPage';

function App() {
    return (
        <Router>
            <div className="App bg-gray-50 min-h-screen">
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

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

                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;