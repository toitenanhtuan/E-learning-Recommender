import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    StarIcon,
    BuildingLibraryIcon,
    BeakerIcon,
    CheckCircleIcon,
    EllipsisVerticalIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/solid';
import { Course } from '../types';

// Định nghĩa kiểu cho các props mà component này nhận vào
export type StatusType = 'not_started' | 'in_progress' | 'completed';

interface CourseCardProps {
    course: Course;
    status?: StatusType; // Trạng thái hiện tại của khóa học, là optional
    onStatusChange?: (courseId: number, newStatus: Exclude<StatusType, 'not_started'>) => void; // Hàm callback khi trạng thái thay đổi
    isFromDashboard?: boolean; // Cờ để biết component có đang ở trên dashboard không
}

// Component Menu Dropdown cho việc thay đổi trạng thái
const StatusMenu: React.FC<{ onSelect: (status: Exclude<StatusType, 'not_started'>) => void }> = ({ onSelect }) => (
    <div
        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5"
        // Ngăn việc click vào menu làm đóng menu hoặc điều hướng thẻ cha
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
        <div className="py-1">
            <button
                onClick={() => onSelect('in_progress')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
                Mark as In Progress
            </button>
            <button
                onClick={() => onSelect('completed')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
                Mark as Completed
            </button>
        </div>
    </div>
);

// Component chính
const CourseCard: React.FC<CourseCardProps> = ({ course, status = 'not_started', onStatusChange, isFromDashboard = false }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Hàm xử lý khi người dùng chọn một trạng thái mới từ menu
    const handleStatusChange = (newStatus: Exclude<StatusType, 'not_started'>) => {
        if (onStatusChange) {
            onStatusChange(course.id, newStatus);
        }
        setIsMenuOpen(false); // Đóng menu sau khi chọn
    };

    // Component nhỏ để hiển thị huy hiệu trạng thái
    const StatusBadge: React.FC<{ status: StatusType }> = ({ status }) => {
        if (status === 'completed') {
            return (
                <div className="absolute top-3 -right-2 transform translate-x-1/2 -rotate-45 bg-green-500 text-white text-xs font-bold px-4 py-1">
                    Done
                </div>
            );
        }
        if (status === 'in_progress') {
            return (
                <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                    In Progress
                </div>
            );
        }
        return null;
    };

    return (
        // Thẻ Link lớn bao ngoài, khi click sẽ đi đến trang chi tiết
        <Link to={`/courses/${course.id}`} className="block h-full">
            <div className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col h-full overflow-hidden">
                {/* Huy hiệu và menu chỉ hiển thị trên Dashboard */}
                {isFromDashboard && (
                    <>
                        <StatusBadge status={status} />
                        <div className="absolute top-2 right-2 z-10">
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                                className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                                aria-label="Course options"
                            >
                                <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
                            </button>
                            {isMenuOpen && <StatusMenu onSelect={handleStatusChange} />}
                        </div>
                    </>
                )}

                {/* Phần nội dung chính của thẻ */}
                <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex-grow pr-8">
                        {course.course_name}
                    </h3>

                    <div className="flex items-center text-sm text-gray-500 mt-auto">
                        <BuildingLibraryIcon className="flex-shrink-0 h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{course.university}</span>
                    </div>
                </div>

                {/* Phần Footer của thẻ */}
                <div className="border-t border-gray-200 p-4 flex justify-between items-center text-sm bg-gray-50">
                    <div className="flex items-center font-semibold text-amber-500">
                        <StarIcon className="flex-shrink-0 h-4 w-4 mr-1" />
                        <span>{course.course_rating ? course.course_rating.toFixed(1) : 'N/A'}</span>
                    </div>

                    <a
                        href={course.course_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} // Quan trọng: Ngăn không cho Link cha bị kích hoạt
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        aria-label={`Go to course ${course.course_name}`}
                    >
                        Visit
                        <ArrowTopRightOnSquareIcon className="ml-1.5 h-4 w-4" />
                    </a>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;