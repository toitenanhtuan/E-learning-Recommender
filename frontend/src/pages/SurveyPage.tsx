import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Skill } from '../types';
import { BeakerIcon, LightBulbIcon, StarIcon } from '@heroicons/react/24/outline';

const SurveyPage: React.FC = () => {
    const navigate = useNavigate();

    // States cho dữ liệu và giao diện
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    // States cho các lựa chọn của người dùng
    const [learningStyle, setLearningStyle] = useState<string>('');
    const [knownSkillIds, setKnownSkillIds] = useState<Set<number>>(new Set());
    const [targetSkillIds, setTargetSkillIds] = useState<Set<number>>(new Set());

    // Dữ liệu cho phần chọn Phong cách học
    const learningStyleOptions = [
        { value: 'visual', label: 'Visual', description: 'I learn best from videos, diagrams, and live demos.', icon: LightBulbIcon },
        { value: 'read_write', label: 'Read/Write', description: 'I learn best from reading texts, articles, and writing notes.', icon: LightBulbIcon },
        { value: 'kinesthetic', label: 'Kinesthetic (Hands-on)', description: 'I learn best by doing projects and practical exercises.', icon: LightBulbIcon },
        { value: 'auditory', label: 'Auditory', description: 'I learn best from lectures and discussions.', icon: LightBulbIcon },
    ];

    // 1. Fetch tất cả kỹ năng khi component được mount
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get<Skill[]>('/survey/skills');
                setAllSkills(response.data);
            } catch (err) {
                setError('Could not load skills. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, []);

    // 2. Các hàm xử lý việc tick/bỏ tick checkbox
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

    // 3. Hàm xử lý khi submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
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
            // Gửi payload hoàn chỉnh lên API
            await apiClient.post('/survey/', {
                known_skill_ids: Array.from(knownSkillIds),
                target_skill_ids: Array.from(targetSkillIds),
                learning_style: learningStyle,
            });

            alert('Survey submitted successfully! You will now be redirected to your dashboard to see the result.');
            navigate('/dashboard'); // Chuyển hướng đến dashboard

        } catch (err) {
            setError('Failed to submit survey. Please try again.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-10 font-semibold text-gray-500">Loading Skills...</div>;

    return (
        <div className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Personalized Learning Plan</h1>
                    <p className="text-gray-600 mb-10">
                        Tell us about yourself. Your answers will help us craft the perfect learning path for you.
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* --- PHẦN 1: PHONG CÁCH HỌC --- */}
                        <div className="mb-10">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Step 1: What's Your Learning Style?</h2>
                            <div className="space-y-4">
                                {learningStyleOptions.map((option) => (
                                    <label key={option.value} className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all duration-200 ${learningStyle === option.value ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="learning-style"
                                            value={option.value}
                                            checked={learningStyle === option.value}
                                            onChange={(e) => setLearningStyle(e.target.value)}
                                            className="h-5 w-5 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300"
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
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Step 2: Select Your Skills</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Cột Kỹ năng đã biết */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center text-gray-700"><StarIcon className="w-5 h-5 mr-2 text-amber-500" />I Already Know...</h3>
                                <div className="p-4 border rounded-lg bg-gray-50 space-y-3 max-h-80 overflow-y-auto">
                                    {allSkills.map(skill => (
                                        <label key={`known-${skill.id}`} className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 rounded" checked={knownSkillIds.has(skill.id)} onChange={() => handleCheckboxChange(skill.id, setKnownSkillIds)} />
                                            <span className="ml-3 text-sm">{skill.skill_name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Cột Kỹ năng muốn học */}
                            <div>
                                <h3 className="font-semibold mb-3 flex items-center text-gray-700"><BeakerIcon className="w-5 h-5 mr-2 text-teal-500" />I Want to Learn...</h3>
                                <div className="p-4 border rounded-lg bg-gray-50 space-y-3 max-h-80 overflow-y-auto">
                                    {allSkills.map(skill => (
                                        <label key={`target-${skill.id}`} className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 rounded" checked={targetSkillIds.has(skill.id)} onChange={() => handleCheckboxChange(skill.id, setTargetSkillIds)} />
                                            <span className="ml-3 text-sm">{skill.skill_name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {error && <p className="mt-6 text-center text-sm text-red-600 font-medium">{error}</p>}

                        {/* --- PHẦN 3: NÚT SUBMIT --- */}
                        <div className="mt-10 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
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