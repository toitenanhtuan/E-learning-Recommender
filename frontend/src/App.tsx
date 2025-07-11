import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CourseDetailPage from './pages/CourseDetailPage';
import Navbar from './components/Navbar'; // Giả sử bạn có Navbar

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
                        {/* Thêm các route khác ở đây */}
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;