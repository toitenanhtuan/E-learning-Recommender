import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Course } from '../types';
import CourseList from '../components/CourseList';
import SearchBar from '../components/SearchBar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const HomePage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get<Course[]>(`${API_URL}/courses`, {
                    params: { search: searchTerm, limit: 100 }
                });
                setCourses(response.data);
            } catch (err) {
                setError('Failed to fetch courses.');
                console.error("API Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [searchTerm]); // Chỉ fetch lại khi searchTerm thay đổi

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Discover Your Next Course</h1>
                <p className="text-lg text-gray-600 mt-2">Find the perfect course to boost your skills.</p>
            </div>

            <div className="max-w-2xl mx-auto">
                <SearchBar onSearch={setSearchTerm} />
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : error ? (
                <div className="text-center py-10 text-red-500 font-semibold">{error}</div>
            ) : (
                <CourseList courses={courses} />
            )}
        </div>
    );
};

export default HomePage;