import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../api/courses';
import { getCategories } from '../../api/categories';
import { createSection, deleteSection } from '../../api/sections';
import { createLecture, deleteLecture } from '../../api/lectures';
import { LEVEL_LABELS, type Level, type Course } from '../../types';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

const LEVELS: Level[] = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED'];

interface CourseFormData {
  title: string;
  description: string;
  thumbnailUrl: string;
  level: Level;
  categoryId: string;
}

const defaultForm: CourseFormData = {
  title: '',
  description: '',
  thumbnailUrl: '',
  level: 'BEGINNER',
  categoryId: '',
};

export default function AdminCourses() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseFormData>(defaultForm);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [sectionForms, setSectionForms] = useState<Record<number, { title: string; youtubeUrl: string; order: string; isPreview: boolean }>>({});

  const { data } = useQuery({
    queryKey: ['courses', 1, undefined, undefined, ''],
    queryFn: () => getCourses({ page: 1, limit: 100 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: expandedCourseData } = useQuery({
    queryKey: ['course', expandedCourse],
    queryFn: () => import('../../api/courses').then((m) => m.getCourse(expandedCourse!)),
    enabled: !!expandedCourse,
  });

  const createMut = useMutation({
    mutationFn: () =>
      createCourse({
        title: form.title,
        description: form.description || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        level: form.level,
        categoryId: Number(form.categoryId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowForm(false);
      setForm(defaultForm);
    },
  });

  const updateMut = useMutation({
    mutationFn: () =>
      updateCourse(editingCourse!.id, {
        title: form.title,
        description: form.description || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
        level: form.level,
        categoryId: Number(form.categoryId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setEditingCourse(null);
      setShowForm(false);
      setForm(defaultForm);
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });

  const addSectionMut = useMutation({
    mutationFn: ({ courseId, title }: { courseId: number; title: string }) =>
      createSection(courseId, { title, order: (expandedCourseData?.sections?.length ?? 0) + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', expandedCourse] });
      setNewSectionTitle('');
    },
  });

  const deleteSectionMut = useMutation({
    mutationFn: ({ courseId, sectionId }: { courseId: number; sectionId: number }) =>
      deleteSection(courseId, sectionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', expandedCourse] }),
  });

  const addLectureMut = useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: number; data: any }) =>
      createLecture(sectionId, data),
    onSuccess: (_, { sectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['course', expandedCourse] });
      setSectionForms((prev) => ({ ...prev, [sectionId]: { title: '', youtubeUrl: '', order: '', isPreview: false } }));
    },
  });

  const deleteLectureMut = useMutation({
    mutationFn: ({ sectionId, lectureId }: { sectionId: number; lectureId: number }) =>
      deleteLecture(sectionId, lectureId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', expandedCourse] }),
  });

  const openCreate = () => {
    setEditingCourse(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description ?? '',
      thumbnailUrl: course.thumbnailUrl ?? '',
      level: course.level,
      categoryId: String(course.category.id),
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">총 {data?.total ?? 0}개 강의</p>
        <button onClick={openCreate} className="flex items-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-600">
          <Plus size={16} /> 강의 등록
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">{editingCourse ? '강의 수정' : '강의 등록'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">제목 *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">설명</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">카테고리 *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">선택</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">난이도</label>
              <select
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as Level }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">썸네일 URL</label>
              <input
                value={form.thumbnailUrl}
                onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => (editingCourse ? updateMut.mutate() : createMut.mutate())}
              disabled={!form.title || !form.categoryId}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50"
            >
              저장
            </button>
            <button onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
              취소
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {data?.courses.map((course) => (
          <div key={course.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedCourse === course.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{course.title}</p>
                <p className="text-xs text-gray-400">{course.category.name} · {LEVEL_LABELS[course.level]}</p>
              </div>
              <button onClick={() => openEdit(course as Course)} className="text-xs text-gray-500 hover:text-orange-500 px-2 py-1">수정</button>
              <button
                onClick={() => {
                  if (confirm('강의를 삭제하시겠습니까?')) deleteMut.mutate(course.id);
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {expandedCourse === course.id && expandedCourseData && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-2 bg-gray-50">
                <div className="flex gap-2 mb-3">
                  <input
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="섹션 제목"
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button
                    onClick={() => newSectionTitle && addSectionMut.mutate({ courseId: course.id, title: newSectionTitle })}
                    className="bg-orange-500 text-white px-3 py-1.5 rounded text-xs hover:bg-orange-600"
                  >
                    섹션 추가
                  </button>
                </div>

                {expandedCourseData.sections?.map((section) => {
                  const sf = sectionForms[section.id] ?? { title: '', youtubeUrl: '', order: '', isPreview: false };
                  return (
                    <div key={section.id} className="mb-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-medium text-gray-600">{section.title}</span>
                        <button
                          onClick={() => {
                            if (confirm('섹션을 삭제하시겠습니까?')) deleteSectionMut.mutate({ courseId: course.id, sectionId: section.id });
                          }}
                          className="text-gray-300 hover:text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {section.lectures.map((lecture) => (
                        <div key={lecture.id} className="flex items-center justify-between px-3 py-2 border-b border-gray-50 text-xs text-gray-600">
                          <span className="truncate flex-1">{lecture.order}. {lecture.title}</span>
                          <button
                            onClick={() => {
                              if (confirm('강의 단위를 삭제하시겠습니까?')) deleteLectureMut.mutate({ sectionId: section.id, lectureId: lecture.id });
                            }}
                            className="text-gray-300 hover:text-red-500 ml-2 shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <div className="p-2 grid grid-cols-2 gap-1.5">
                        <input
                          value={sf.title}
                          onChange={(e) => setSectionForms((p) => ({ ...p, [section.id]: { ...sf, title: e.target.value } }))}
                          placeholder="강의 제목"
                          className="col-span-2 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                        <input
                          value={sf.youtubeUrl}
                          onChange={(e) => setSectionForms((p) => ({ ...p, [section.id]: { ...sf, youtubeUrl: e.target.value } }))}
                          placeholder="YouTube URL"
                          className="col-span-2 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                        <input
                          value={sf.order}
                          onChange={(e) => setSectionForms((p) => ({ ...p, [section.id]: { ...sf, order: e.target.value } }))}
                          placeholder="순서"
                          type="number"
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                        <label className="flex items-center gap-1 text-xs text-gray-500">
                          <input
                            type="checkbox"
                            checked={sf.isPreview}
                            onChange={(e) => setSectionForms((p) => ({ ...p, [section.id]: { ...sf, isPreview: e.target.checked } }))}
                          />
                          미리보기
                        </label>
                        <button
                          onClick={() => {
                            if (sf.title && sf.youtubeUrl && sf.order) {
                              addLectureMut.mutate({
                                sectionId: section.id,
                                data: { title: sf.title, youtubeUrl: sf.youtubeUrl, order: Number(sf.order), isPreview: sf.isPreview },
                              });
                            }
                          }}
                          className="col-span-2 bg-gray-700 text-white rounded px-2 py-1 text-xs hover:bg-gray-800 disabled:opacity-50"
                          disabled={!sf.title || !sf.youtubeUrl || !sf.order}
                        >
                          강의 단위 추가
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
