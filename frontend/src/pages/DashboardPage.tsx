// frontend/src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Course } from '../types';
import CourseList from '../components/CourseList';
import SkillGapPieChart from '../components/analytics/SkillGapPieChart'; // Import component biểu đồ
import { RocketLaunchIcon, PencilIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Định nghĩa kiểu dữ liệu cho Analytics
interface AnalyticsData {
    known_skills_percentage: number;
    gap_skills_percentage: number;
    known_skills: number;
    gap_skills: number;
    gap_skill_names: string[];
}

const DashboardPage: React.FC = () => {
    const [learningPath, setLearningPath] = useState<Course[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [needsSurvey, setNeedsSurvey] = useState<boolean>(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setNeedsSurvey(false);
            try {
                // Gọi song song cả hai API
                const [pathResponse, analyticsResponse] = await Promise.all([
                    apiClient.get<Course[]>('/users/me/personalized-path'),
                    apiClient.get<AnalyticsData>('/users/me/skill-gap-analytics'),
                ]);

                setLearningPath(pathResponse.data);
                setAnalytics(analyticsResponse.data);

            } catch (err: any) {
                if (err.response && err.response.status === 400) {
                    setNeedsSurvey(true);
                } else {
                    setError('An error occurred while loading your dashboard.');
                }
                console.error("Dashboard API Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const renderNeedSurvey = () => (
        <div className="text-center bg-white p-10 rounded-lg shadow-md mt-8">
            <PencilIcon className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Create Your Learning Journey</h2>
            <p className="text-gray-600 mb-6">Please complete the survey to generate your personalized path and analytics.</p>
            <Link to="/survey" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg">
                Start Survey
            </Link>
        </div>
    );

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;
    if (needsSurvey) return <div className="container mx-auto p-8">{renderNeedSurvey()}</div>;
    if (error || !analytics) return <div className="p-10 text-center text-red-500">{error || 'Could not load data.'}</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex items-center mb-8">
                <RocketLaunchIcon className="h-10 w-10 text-indigo-600 mr-4" />
                <h1 className="text-3xl font-bold text-gray-800">Your Learning Dashboard</h1>
            </div>

            {/* PHẦN MỚI: Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Biểu đồ tròn */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Your Skill Progress</h2>
                    <SkillGapPieChart known={analytics.known_skills} gap={analytics.gap_skills} />
                </div>
                {/* Thống kê chi tiết */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center">
                    <h2 className="text-xl font-semibold mb-4">Analytics</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-600">Target Skills</span>
                            <span className="font-bold text-2xl text-gray-800">{analytics.known_skills + analytics.gap_skills}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-600 flex items-center"><CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />Skills You Know</span>
                            <span className="font-bold text-2xl text-green-600">{analytics.known_skills}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-600 flex items-center"><InformationCircleIcon className="h-5 w-5 mr-2 text-amber-500" />Skills to Learn</span>
                            <span className="font-bold text-2xl text-amber-600">{analytics.gap_skills}</span>
                        </div>
                        <div className="pt-4 border-t">
                            <h3 className="font-semibold text-gray-700 mb-2">Next Skills to Focus On:</h3>
                            <div className="flex flex-wrap gap-2">
                                {analytics.gap_skill_names.slice(0, 5).map(skill => (
                                    <span key={skill} className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PHẦN CŨ: Lộ trình học tập */}
            <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Recommended Learning Path</h2>
                {learningPath.length > 0 ? (
                    <CourseList courses={learningPath} />
                ) : (
                    <p className="text-gray-500 bg-white p-6 rounded-md">You've mastered all your target skills!</p>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;