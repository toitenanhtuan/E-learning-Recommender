import React from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon } from '@heroicons/react/24/solid';

const Navbar: React.FC = () => {
    return (
        <nav className="bg-gray-800 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center text-white">
                        <AcademicCapIcon className="h-8 w-8 text-indigo-400" />
                        <span className="ml-3 text-xl font-bold">CourseRecommender</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center">
                        <Link to="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                            Home
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;