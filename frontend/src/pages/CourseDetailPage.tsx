import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Course } from '../types'; // <- Dùng định nghĩa chuẩn từ types.ts
import CourseList from '../components/CourseList'; // <- Tái sử dụng component CourseList
import { StarIcon, BeakerIcon, BookOpenIcon } from '@heroicons/react/24/solid';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const CourseDetailPage: React.FC = () => {
    // Lấy 'courseId' từ URL, ví dụ: /courses/5
    const { courseId } = useParams<{ courseId: string }>();

    // States để lưu trữ dữ liệu, trạng thái loading và lỗi
    const [course, setCourse] = useState<Course | null>(null);
    const [recommendations, setRecommendations] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        // Hàm để gọi API và lấy dữ liệu
        const fetchCourseData = async () => {
            if (!courseId) return;

            setLoading(true);
            setError('');

            try {
                // Sử dụng Promise.all để gọi cả hai API cùng lúc, tăng hiệu năng
                const [courseDetailsResponse, recommendationsResponse] = await Promise.all([
                    axios.get<Course>(`${API_URL}/courses/${courseId}`),
                    axios.get<Course[]>(`${API_URL}/recommendations/content-based/${courseId}`)
                ]);

                // Cập nhật state với dữ liệu nhận được
                setCourse(courseDetailsResponse.data);
                setRecommendations(recommendationsResponse.data);

            } catch (err) {
                setError('Failed to fetch course data. Please try again later.');
                console.error("API Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId]); // Dependency array: useEffect sẽ chạy lại mỗi khi courseId thay đổi

    // Giao diện khi đang tải dữ liệu
    if (loading) {
        return <div className="text-center p-10">Loading course details...</div>;
    }

    // Giao diện khi có lỗi
    if (error) {
        return <div className="text-center p-10 text-red-500 font-semibold">{error}</div>;
    }

    // Giao diện khi không tìm thấy khóa học
    if (!course) {
        return <div className="text-center p-10">Course not found.</div>;
    }

    // Giao diện chính khi đã có dữ liệu
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
                {/* Phần Header của khóa học */}
                <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{course.course_name}</h1>
                    <p className="text-lg text-gray-500 mb-4">{course.university}</p>

                    {/* Các thông số phụ */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-700">
                        <div className="flex items-center">
                            <StarIcon className="h-5 w-5 mr-1.5 text-amber-400" />
                            <span className="font-semibold">{course.course_rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center">
                            <BeakerIcon className="h-5 w-5 mr-1.5 text-indigo-500" />
                            <span className="capitalize">{course.difficulty_level}</span>
                        </div>
                    </div>

                    {/* Mô tả khóa học */}
                    {course.course_description && (
                        <div className="mt-6 border-t pt-6">
                            <h2 className="text-xl font-semibold flex items-center mb-2">
                                <BookOpenIcon className="h-6 w-6 mr-2" />
                                About this course
                            </h2>
                            <p className="text-gray-600 leading-relaxed">{course.course_description}</p>
                        </div>
                    )}
                </div>

                {/* Phần gợi ý các khóa học tương tự */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Similar Courses You Might Like</h2>
                    {recommendations.length > 0 ? (
                        <CourseList courses={recommendations} />
                    ) : (
                        <p className="text-gray-500 bg-white p-6 rounded-md shadow-sm">No similar courses found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;