'use client';
import { useState } from 'react';

interface CommentFormProps {
  onSubmit?: (data: { name: string; comment: string }) => void;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && name.trim() && comment.trim()) {
      onSubmit({ name, comment });
      setName('');
      setComment('');
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded border border-gray-300">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Name:
          </label>
          <input
            type="text"
            placeholder="Your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Comment:
          </label>
          <textarea
            placeholder="Write your comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 text-sm h-20"
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm transition"
        >
          Post Comment
        </button>
      </form>
    </div>
  );
}
