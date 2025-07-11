import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
    onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [term, setTerm] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTerm(event.target.value);
    };

    // Tìm kiếm ngay khi người dùng gõ
    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            onSearch(term);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [term, onSearch]);


    return (
        <form onSubmit={(e) => e.preventDefault()} className="w-full mb-8">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    {/* Kích thước h-5 w-5 cho icon nhỏ bên trong input */}
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    id="search"
                    name="search"
                    className="block w-full rounded-md border-0 bg-white py-2.5 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Search for courses..."
                    type="search"
                    value={term}
                    onChange={handleInputChange}
                />
            </div>
        </form>
    );
};

export default SearchBar;