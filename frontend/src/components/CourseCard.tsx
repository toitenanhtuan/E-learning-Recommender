import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, BuildingLibraryIcon, BeakerIcon } from '@heroicons/react/24/solid';

// Định nghĩa cấu trúc của một đối tượng Course
export interface Course {
    id: number;
    course_name: string;
    university: string;
    difficulty_level: string;
    course_rating: number;
}

// Định nghĩa props mà component này nhận vào
interface CourseCardProps {
    course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    return (
        <Link to={`/courses/${course.id}`} className="block w-full">
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out p-6 flex flex-col h-full">
                {/* Course Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex-grow">
                    {course.course_name}
                </h3>

                {/* University */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                    <BuildingLibraryIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{course.university}</span>
                </div>

                {/* Footer section with Difficulty and Rating */}
                <div className="mt-auto border-t border-gray-200 pt-4 flex justify-between items-center text-sm">
                    {/* Difficulty Level */}
                    <div className="flex items-center text-gray-600">
                        <BeakerIcon className="h-4 w-4 mr-2 text-indigo-500" />
                        <span className="capitalize">{course.difficulty_level || 'N/A'}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center font-semibold text-amber-500">
                        <StarIcon className="h-4 w-4 mr-1" />
                        <span>{course.course_rating.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;