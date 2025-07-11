import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Skill } from '../types';

// Import component con và các icon
import SearchableCheckboxList from '../components/SearchableCheckboxList';
import { BeakerIcon, LightBulbIcon, StarIcon } from '@heroicons/react/24/outline';

// Định nghĩa dữ liệu cho phần chọn Phong cách học
const learningStyleOptions = [
    { value: 'visual', label: 'Visual', description: 'I learn best from videos, diagrams, and live demos.' },
    { value: 'read_write', label: 'Read/Write', description: 'I learn best from reading texts, articles, and writing notes.' },
    { value: 'kinesthetic', label: 'Kinesthetic (Hands-on)', description: 'I learn best by doing projects and practical exercises.' },
    { value: 'auditory', label: 'Auditory', description: 'I learn best from lectures and discussions.' },
];

const SurveyPage: React.FC = () => {
    const navigate = useNavigate();

    // === STATES QUẢN LÝ DỮ LIỆU VÀ GIAO DIỆN ===
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    // === STATES QUẢN LÝ LỰA CHỌN CỦA NGƯỜI DÙNG ===
    const [learningStyle, setLearningStyle] = useState<string>('');
    const [knownSkillIds, setKnownSkillIds] = useState<Set<number>>(new Set());
    const [targetSkillIds, setTargetSkillIds] = useState<Set<number>>(new Set());

    // --- LOGIC ---

    // 1. Fetch tất cả các kỹ năng từ server khi component được tải lần đầu
    useEffect(() => {
        const fetchSkills = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get<Skill[]>('/survey/skills');
                setAllSkills(response.data);
            } catch (err) {
                setError('Could not load skills list. Please try again later.');
                console.error("Failed to fetch skills:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, []);

    // 2. Hàm chung để xử lý việc chọn/bỏ chọn checkbox kỹ năng
    const handleCheckboxChange = (skillId: number, stateSetter: React.Dispatch<React.SetStateAction<Set<number>>>) => {
        stateSetter(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(skillId)) {
                newSet.delete(skillId);
            } else {
                newSet.add(skillId);
            }
            return newSet;
        });
    };

    // 3. Hàm xử lý khi người dùng nhấn nút submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Kiểm tra dữ liệu đầu vào
        if (!learningStyle) {
            setError('Please select your preferred learning style.');
            return;
        }
        if (targetSkillIds.size === 0) {
            setError('Please select at least one skill you want to learn.');
            return;
        }

        setSubmitting(true);
        try {
            // Gọi API để gửi dữ liệu khảo sát, sử dụng apiClient để tự đính kèm token
            await apiClient.post('/survey/', {
                known_skill_ids: Array.from(knownSkillIds),
                target_skill_ids: Array.from(targetSkillIds),
                learning_style: learningStyle,
            });

            alert('Survey submitted successfully! You will now be redirected to your dashboard to see your personalized plan.');
            navigate('/dashboard'); // Chuyển hướng người dùng đến trang dashboard

        } catch (err) {
            setError('Failed to submit survey. Please try again later.');
            console.error("Failed to submit survey:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // --- RENDER ---

    // Hiển thị trạng thái loading ban đầu
    if (loading) return <div className="text-center p-20 font-semibold text-gray-500">Loading Survey...</div>;

    return (
        <div className="bg-gray-50 py-10 sm:py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-lg">
                    {/* Phần tiêu đề */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Personalize Your Learning</h1>
                        <p className="mt-3 text-lg text-gray-600">
                            Your answers will help our AI craft the perfect learning path for you.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-10 space-y-12">
                        {/* --- PHẦN 1: PHONG CÁCH HỌC --- */}
                        <div className="border-b border-gray-200 pb-12">
                            <h2 className="text-xl font-semibold mb-1 text-gray-800 flex items-center">
                                <LightBulbIcon className="h-6 w-6 mr-2 text-indigo-600" />
                                Step 1: How do you learn best?
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">Select the style that describes you the most.</p>
                            <div className="space-y-4">
                                {learningStyleOptions.map((option) => (
                                    <label key={option.value} className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 ${learningStyle === option.value ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="learning-style"
                                            value={option.value}
                                            checked={learningStyle === option.value}
                                            onChange={(e) => setLearningStyle(e.target.value)}
                                            className="h-5 w-5 mt-0.5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <div className="ml-4">
                                            <span className="font-medium text-gray-900">{option.label}</span>
                                            <p className="text-sm text-gray-500">{option.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* --- PHẦN 2: CHỌN KỸ NĂNG --- */}
                        <div className="border-b border-gray-200 pb-12">
                            <h2 className="text-xl font-semibold mb-1 text-gray-800">Step 2: What are your skills?</h2>
                            <p className="text-sm text-gray-500 mb-6">Use the search bar to find skills quickly.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                <SearchableCheckboxList
                                    title="Skills I Already Know"
                                    icon={<StarIcon className="w-5 h-5 mr-2 text-amber-500" />}
                                    allSkills={allSkills}
                                    selectedSkillIds={knownSkillIds}
                                    onSkillChange={(id) => handleCheckboxChange(id, setKnownSkillIds)}
                                />
                                <SearchableCheckboxList
                                    title="Skills I Want to Learn"
                                    icon={<BeakerIcon className="w-5 h-5 mr-2 text-teal-500" />}
                                    allSkills={allSkills}
                                    selectedSkillIds={targetSkillIds}
                                    onSkillChange={(id) => handleCheckboxChange(id, setTargetSkillIds)}
                                />
                            </div>
                        </div>

                        {/* --- PHẦN 3: NÚT SUBMIT VÀ THÔNG BÁO LỖI --- */}
                        <div className="mt-6">
                            {error && <p className="mb-4 text-center text-sm text-red-600 font-medium bg-red-50 p-3 rounded-md">{error}</p>}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Generating Your Path...' : 'Generate My Personalized Path'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SurveyPage;