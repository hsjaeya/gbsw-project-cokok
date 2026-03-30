import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LEVEL_LABELS, type CourseListItem } from '../types';

interface Props {
  course: CourseListItem;
}

export default function CourseCard({ course }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link to={`/courses/${course.id}`} className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="h-44 bg-gray-200 overflow-hidden">
        {course.thumbnailUrl && !imgError ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-300 text-4xl">
            🍳
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
            {course.category.name}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {LEVEL_LABELS[course.level]}
          </span>
        </div>
        <h3 className="font-semibold text-gray-800 line-clamp-2">{course.title}</h3>
        {course.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
        )}
      </div>
    </Link>
  );
}
