-- Bảng lưu thông tin các khóa học
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    university VARCHAR(255),
    difficulty_level VARCHAR(50),
    course_rating REAL,
    course_url TEXT,
    course_description TEXT,
    course_format VARCHAR(50) DEFAULT 'mixed', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lưu danh sách các kỹ năng duy nhất
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng nối nhiều-nhiều giữa courses và skills
CREATE TABLE course_skills (
    course_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    PRIMARY KEY (course_id, skill_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- ===== CÁC BẢNG DÀNH CHO CÁC GIAI ĐOẠN SAU (Tạo sẵn để tham khảo) =====

-- Bảng người dùng
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL, -- THÊM DÒNG NÀY
    is_active BOOLEAN DEFAULT TRUE,         -- THÊM DÒNG NÀY
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng hồ sơ người dùng, chứa thông tin cá nhân hóa
CREATE TABLE user_profiles (
    user_id INTEGER PRIMARY KEY,
    full_name VARCHAR(255),
    -- Cột mới cho phong cách học
    learning_style VARCHAR(50), -- Ví dụ: 'visual', 'auditory', 'read_write', 'kinesthetic'
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Bảng nối nhiều-nhiều: người dùng và kỹ năng họ ĐÃ BIẾT
CREATE TABLE user_known_skills (
    user_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Bảng nối nhiều-nhiều: người dùng và kỹ năng họ MUỐN HỌC
CREATE TABLE user_target_skills (
    user_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);