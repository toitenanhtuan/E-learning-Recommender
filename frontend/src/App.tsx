import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import các trang và component
import HomePage from './pages/HomePage';
import CourseDetailPage from './pages/CourseDetailPage';
import Navbar from './components/Navbar';

function App() {
    return (
        <Router>
            <div className="App bg-gray-50 min-h-screen">
                <Navbar />
                <main className="pt-4">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;