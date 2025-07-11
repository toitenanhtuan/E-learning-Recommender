/**
 * File này chứa các định nghĩa kiểu TypeScript dùng chung cho toàn bộ ứng dụng.
 */

// Định nghĩa cấu trúc cho một đối tượng Skill
export interface Skill {
    id: number;
    skill_name: string;
}

// Định nghĩa cấu trúc cho một đối tượng Course
// Đây là kiểu dữ liệu chính mà chúng ta làm việc
export interface Course {
    id: number;
    course_name: string;
    university: string;
    difficulty_level: string;
    course_rating: number;

    // Các thuộc tính có thể có hoặc không (optional)
    // Dùng dấu '?' để khai báo
    course_url?: string;
    course_description?: string;
    skills?: Skill[]; // Một mảng các đối tượng Skill
}