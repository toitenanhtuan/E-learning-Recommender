import React from 'react';
import CourseCard from './CourseCard';
import { Course } from '../types';

// Định nghĩa kiểu cho Map chứa tiến độ
interface ProgressMap {
    [courseId: number]: 'not_started' | 'in_progress' | 'completed';
}

interface CourseListProps {
    courses: Course[];
    progressMap?: ProgressMap; // Progress map là optional
    onStatusChange?: (courseId: number, newStatus: 'in_progress' | 'completed') => void;
    isFromDashboard?: boolean;
}

const CourseList: React.FC<CourseListProps> = ({ courses, progressMap = {}, onStatusChange, isFromDashboard = false }) => {
    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">No courses found for this path.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
                <CourseCard
                    key={course.id}
                    course={course}
                    // Truyền các props mới xuống CourseCard
                    status={progressMap[course.id] || 'not_started'}
                    onStatusChange={onStatusChange}
                    isFromDashboard={isFromDashboard}
                />
            ))}
        </div>
    );
};

export default CourseList;