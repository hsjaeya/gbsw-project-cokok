import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCourses } from '../../api/courses';
import { getCategories } from '../../api/categories';
import { LEVEL_LABELS, type Level } from '../../types';
import CourseCard from '../../components/CourseCard';

const LEVELS: Level[] = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED'];

export default function Home() {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [level, setLevel] = useState<Level | undefined>();
  const [keyword, setKeyword] = useState('');
  const [inputKeyword, setInputKeyword] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['courses', page, categoryId, level, keyword],
    queryFn: () => getCourses({ page, limit: 12, categoryId, level, keyword }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(inputKeyword);
    setPage(1);
  };

  const handleCategoryChange = (id: number | undefined) => {
    setCategoryId(id);
    setPage(1);
  };

  const handleLevelChange = (l: Level | undefined) => {
    setLevel(l);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">요리를 배워보세요</h1>
        <p className="text-gray-500">체계적인 커리큘럼으로 요리 실력을 키워보세요</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputKeyword}
          onChange={(e) => setInputKeyword(e.target.value)}
          placeholder="강의 제목 검색..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm hover:bg-orange-600"
        >
          검색
        </button>
      </form>

      <div className="flex gap-6 mb-8">
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">카테고리</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange(undefined)}
              className={`text-xs px-3 py-1 rounded-full border ${!categoryId ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600 hover:border-orange-400'}`}
            >
              전체
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-xs px-3 py-1 rounded-full border ${categoryId === cat.id ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600 hover:border-orange-400'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">난이도</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleLevelChange(undefined)}
              className={`text-xs px-3 py-1 rounded-full border ${!level ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600 hover:border-orange-400'}`}
            >
              전체
            </button>
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => handleLevelChange(l)}
                className={`text-xs px-3 py-1 rounded-full border ${level === l ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600 hover:border-orange-400'}`}
              >
                {LEVEL_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-60 animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : data?.courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">강의가 없습니다.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm ${p === page ? 'bg-orange-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-orange-400'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
