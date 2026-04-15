import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react';

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const createMut = useMutation({
    mutationFn: () => createCategory(newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewName('');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditId(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const startEdit = (id: number, name: string) => {
    setEditId(id);
    setEditName(name);
  };

  if (isLoading) return <div className="text-gray-400 text-sm">로딩 중...</div>;

  return (
    <div className="max-w-md">
      <div className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="새 카테고리 이름"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          onKeyDown={(e) => e.key === 'Enter' && newName && createMut.mutate()}
        />
        <button
          onClick={() => newName && createMut.mutate()}
          disabled={!newName || createMut.isPending}
          className="flex items-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50"
        >
          <Plus size={16} /> 추가
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {categories?.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
            {editId === cat.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  autoFocus
                />
                <button onClick={() => updateMut.mutate({ id: cat.id, name: editName })} className="text-green-500 hover:text-green-600">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-700">{cat.name}</span>
                <button onClick={() => startEdit(cat.id, cat.name)} className="text-gray-400 hover:text-orange-500">
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?`)) {
                      deleteMut.mutate(cat.id);
                    }
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
