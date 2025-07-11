import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { Course } from '../types';

// Import các component con
import CourseList from '../components/CourseList';
import SkillGapPieChart from '../components/analytics/SkillGapPieChart';

// Import các icon
import { RocketLaunchIcon, PencilIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Định nghĩa kiểu dữ liệu cho dữ liệu trả về từ API
interface AnalyticsData {
    total_target_skills: number;
    known_skills: number;
    gap_skills: number;
    known_skills_percentage: number;
    gap_skills_percentage: number;
    gap_skill_names: string[];
}
interface ProgressItem {
    course_id: number;
    status: 'not_started' | 'in_progress' | 'completed';
}
interface ProgressMap {
    [courseId: number]: 'not_started' | 'in_progress' | 'completed';
}

const DashboardPage: React.FC = () => {
    // === STATES ===
    const [learningPath, setLearningPath] = useState<Course[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [progressMap, setProgressMap] = useState<ProgressMap>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [needsSurvey, setNeedsSurvey] = useState<boolean>(false);

    // === DATA FETCHING ===
    // Dùng useCallback để hàm không bị tạo lại mỗi lần re-render, giúp tối ưu
    const fetchDashboardData = useCallback(async () => {
        // Không set loading ở đây để tránh chớp màn hình khi refresh
        try {
            const [pathResponse, analyticsResponse, progressResponse] = await Promise.all([
                apiClient.get<Course[]>('/users/me/personalized-path'),
                apiClient.get<AnalyticsData>('/users/me/skill-gap-analytics'),
                apiClient.get<ProgressItem[]>('/users/me/progress'),
            ]);

            setLearningPath(pathResponse.data);
            setAnalytics(analyticsResponse.data);

            const newProgressMap: ProgressMap = {};
            progressResponse.data.forEach(item => {
                newProgressMap[item.course_id] = item.status;
            });
            setProgressMap(newProgressMap);
            setNeedsSurvey(false);

        } catch (err: any) {
            if (err.response && err.response.status === 400) {
                setNeedsSurvey(true);
            } else {
                setError('An error occurred while loading your dashboard.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect để fetch dữ liệu lần đầu tiên
    useEffect(() => {
        setLoading(true); // Chỉ set loading lần đầu
        fetchDashboardData();
    }, [fetchDashboardData]);

    // === EVENT HANDLERS ===
    const handleStatusChange = async (courseId: number, status: 'in_progress' | 'completed') => {
        const originalProgress = { ...progressMap };
        // Cập nhật UI ngay lập tức để người dùng thấy phản hồi
        setProgressMap(prev => ({ ...prev, [courseId]: status }));

        try {
            await apiClient.post('/users/me/progress', { course_id: courseId, status });
            // Tải lại toàn bộ dashboard để analytics và lộ trình được tính toán lại
            alert("Progress updated! Your dashboard will now refresh to reflect the changes.");
            setLoading(true); // Hiển thị trạng thái loading khi đang refresh
            await fetchDashboardData();
        } catch (error) {
            console.error("Failed to update progress", error);
            alert("Could not update progress. Reverting changes.");
            // Nếu API lỗi, trả lại trạng thái cũ trên UI
            setProgressMap(originalProgress);
        }
    };

    // === RENDER LOGIC ===
    const renderContent = () => {
        // Trường hợp cần làm khảo sát
        if (needsSurvey) {
            return (
                <div className="text-center bg-white p-10 rounded-lg shadow-md mt-8">
                    <PencilIcon className="h-12 w-12 mx-auto text-indigo-500 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Create Your Learning Journey</h2>
                    <p className="text-gray-600 mb-6">Please complete the survey to generate your personalized path and analytics.</p>
                    <Link to="/survey" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg">
                        Start Survey Now
                    </Link>
                </div>
            );
        }

        // Trường hợp có lỗi
        if (error || !analytics) {
            return <div className="p-10 text-center text-red-500 font-semibold">{error || 'Could not load dashboard data.'}</div>;
        }

        // Trường hợp thành công
        return (
            <>
                {/* Khu vực Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Your Skill Progress Overview</h2>
                        <SkillGapPieChart known={analytics.known_skills} gap={analytics.gap_skills} />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center">
                        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-baseline"><span className="text-gray-600">Total Target Skills</span><span className="font-bold text-2xl">{analytics.total_target_skills}</span></div>
                            <div className="flex justify-between items-baseline text-green-600"><span className="flex items-center"><CheckCircleIcon className="h-5 w-5 mr-2" />Skills You Know</span><span className="font-bold text-2xl">{analytics.known_skills}</span></div>
                            <div className="flex justify-between items-baseline text-amber-600"><span className="flex items-center"><InformationCircleIcon className="h-5 w-5 mr-2" />Skills to Learn</span><span className="font-bold text-2xl">{analytics.gap_skills}</span></div>
                        </div>
                    </div>
                </div>

                {/* Khu vực Lộ trình học tập */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Recommended Learning Path</h2>
                    {learningPath.length > 0 ? (
                        <CourseList
                            courses={learningPath}
                            progressMap={progressMap}
                            onStatusChange={handleStatusChange}
                            isFromDashboard={true}
                        />
                    ) : (
                        <div className="text-center bg-white p-10 rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold text-gray-800">You're All Set!</h2>
                            <p className="text-gray-600">You've mastered all your target skills. Consider updating your survey with new goals!</p>
                        </div>
                    )}
                </div>
            </>
        )
    };

    // --- MAIN RETURN ---
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex items-center mb-8">
                <RocketLaunchIcon className="h-10 w-10 text-indigo-600 mr-4 flex-shrink-0" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Your Learning Dashboard</h1>
                    <p className="text-gray-500 mt-1">This is your mission control for achieving your learning goals.</p>
                </div>
            </div>

            {loading ? <div className="text-center p-20 font-semibold text-gray-500">Loading Dashboard...</div> : renderContent()}
        </div>
    );
};

export default DashboardPage;