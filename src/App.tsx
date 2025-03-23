import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TodoItem } from './components/TodoItem';
import { Todo, Filter } from './types';

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    setTodos([
      ...todos,
      { id: crypto.randomUUID(), text: newTodo.trim(), completed: false }
    ]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-colors ${
      darkMode 
        ? 'from-purple-900 via-blue-900 to-blue-800'
        : 'from-purple-400 via-blue-400 to-blue-500'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold tracking-widest text-white">TODO</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-white hover:text-yellow-200 transition-colors"
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        <form onSubmit={addTodo} className="mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Create a new todo..."
            className="w-full px-6 py-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </form>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTodos}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="p-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{todos.filter(t => !t.completed).length} items left</span>
            
            <div className="flex gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`hover:text-purple-500 ${filter === 'all' ? 'text-purple-500 font-bold' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`hover:text-purple-500 ${filter === 'active' ? 'text-purple-500 font-bold' : ''}`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`hover:text-purple-500 ${filter === 'completed' ? 'text-purple-500 font-bold' : ''}`}
              >
                Completed
              </button>
            </div>

            <button
              onClick={clearCompleted}
              className="hover:text-purple-500"
            >
              Clear completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;