import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Course } from '../types';
import CourseList from '../components/CourseList';
import { RocketLaunchIcon, PencilIcon } from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
    const [learningPath, setLearningPath] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [needsSurvey, setNeedsSurvey] = useState<boolean>(false);

    useEffect(() => {
        const fetchPersonalizedPath = async () => {
            setLoading(true);
            setNeedsSurvey(false); // Reset trạng thái
            try {
                const response = await apiClient.get<Course[]>('/users/me/personalized-path');
                setLearningPath(response.data);
            } catch (err: any) {
                // Xử lý trường hợp đặc biệt: user chưa làm khảo sát
                if (err.response && err.response.status === 400) {
                    setNeedsSurvey(true);
                    setError(err.response.data.detail || 'Please complete the survey to generate your path.');
                } else {
                    setError('Could not load your learning path. Please try again later.');
                }
                console.error("API Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPersonalizedPath();
    }, []); // Chỉ chạy một lần khi component được mount

    const renderContent = () => {
        // Trường hợp 1: Đang tải dữ liệu
        if (loading) {
            return <div className="text-center p-10">Generating your personalized path...</div>;
        }

        // Trường hợp 2: Cần làm khảo sát
        if (needsSurvey) {
            return (
                <div className="text-center bg-white p-10 rounded-lg shadow-md">
                    <PencilIcon className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Create Your Learning Journey</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        to="/survey"
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
                    >
                        Start Survey
                    </Link>
                </div>
            );
        }

        // Trường hợp 3: Có lỗi khác
        if (error) {
            return <div className="text-center p-10 text-red-500 font-semibold">{error}</div>;
        }

        // Trường hợp 4: Có lộ trình nhưng không có khóa học nào được tìm thấy
        if (learningPath.length === 0) {
            return (
                <div className="text-center bg-white p-10 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800">You're All Set!</h2>
                    <p className="text-gray-600">
                        Based on your survey, it seems you already know all the skills you want to learn, or we couldn't find a matching path right now.
                    </p>
                </div>
            );
        }

        // Trường hợp 5 (thành công): Hiển thị lộ trình
        return <CourseList courses={learningPath} />;
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex items-center mb-8">
                <RocketLaunchIcon className="h-10 w-10 text-indigo-600 mr-4" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Your Personalized Dashboard</h1>
                    <p className="text-gray-500">Here is your recommended learning path to achieve your goals.</p>
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

export default DashboardPage;