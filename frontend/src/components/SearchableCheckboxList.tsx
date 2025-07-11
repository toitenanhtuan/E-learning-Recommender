import React, { useState, useMemo } from 'react';
import { Skill } from '../types';

interface SearchableCheckboxListProps {
    title: string;
    icon: React.ReactNode;
    allSkills: Skill[];
    selectedSkillIds: Set<number>;
    onSkillChange: (skillId: number) => void;
}

const SearchableCheckboxList: React.FC<SearchableCheckboxListProps> = ({ title, icon, allSkills, selectedSkillIds, onSkillChange }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSkills = useMemo(() => {
        if (!searchTerm) {
            return allSkills;
        }
        return allSkills.filter(skill =>
            skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allSkills, searchTerm]);

    return (
        <div>
            <h3 className="font-semibold mb-3 flex items-center text-gray-700">{icon}{title}</h3>

            {/* Search Input */}
            <input
                type="text"
                placeholder={`Search in ${allSkills.length} skills...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />

            {/* Checkbox List */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-3 max-h-80 overflow-y-auto">
                {filteredSkills.length > 0 ? (
                    filteredSkills.map(skill => (
                        <label key={skill.id} className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={selectedSkillIds.has(skill.id)}
                                onChange={() => onSkillChange(skill.id)}
                            />
                            <span className="ml-3 text-sm capitalize">{skill.skill_name}</span>
                        </label>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center">No skills found.</p>
                )}
            </div>
        </div>
    );
};

export default SearchableCheckboxList;