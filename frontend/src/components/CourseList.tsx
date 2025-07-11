import React from 'react';
import { Course } from '../types';
import CourseCard from './CourseCard';

// Định nghĩa props
interface CourseListProps {
    courses: Course[];
}

const CourseList: React.FC<CourseListProps> = ({ courses }) => {
    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">No courses found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
};

export default CourseList;