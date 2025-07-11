import React from 'react';
import { Link } from 'react-router-dom';
import { AcademicCapIcon } from '@heroicons/react/24/solid';

const Navbar: React.FC = () => {
    return (
        <nav className="bg-gray-800 shadow-lg">
            <div className="container mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo and App Name */}
                    <Link to="/" className="flex items-center text-white">
                        <AcademicCapIcon className="h-8 w-8 text-indigo-400" />
                        <span className="ml-3 text-xl font-bold">CourseRecommender</span>
                    </Link>

                    {/* Navigation Links (You can add more links here later) */}
                    <div className="flex items-center">
                        <Link to="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                            Home
                        </Link>
                        {/* Example of another link */}
                        {/* <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">About</a> */}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;