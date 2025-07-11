import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChartPieIcon, AcademicCapIcon, ArrowRightOnRectangleIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext'; // Import hook useAuth

const Navbar: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Chuyển về trang chủ sau khi logout
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and App Name */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center text-gray-800">
                            <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
                            <span className="ml-3 text-xl font-bold">CourseRecommender</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            Home
                        </Link>

                        {/* Conditional rendering based on authentication state */}
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <ChartPieIcon className="h-5 w-5 mr-1" />
                                    Dashboard
                                </Link>
                                <Link to="/survey" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                                    <PencilSquareIcon className="h-5 w-5 mr-1" />
                                    Survey
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;