import React, { useState } from 'react';
import { Note, NoteFolder } from '../types';
import { Plus, Save, Trash2, Folder, FolderPlus, MoreVertical, X, Check } from 'lucide-react';

interface NotesBoardProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  folders: NoteFolder[];
  setFolders: React.Dispatch<React.SetStateAction<NoteFolder[]>>;
}

const COLORS = [
  'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500',
  'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
  'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

export const NotesBoard: React.FC<NotesBoardProps> = ({ notes, setNotes, folders, setFolders }) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('ALL'); // 'ALL' or folder ID
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolder, setNewFolder] = useState<{name: string, color: string}>({ name: '', color: COLORS[8] });

  // Create a new note
  const handleCreateNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now(),
      folderId: selectedFolderId === 'ALL' ? undefined : selectedFolderId
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this note?')) {
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNoteId === id) setSelectedNoteId(null);
    }
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolder.name.trim()) return;
    const folder: NoteFolder = {
      id: crypto.randomUUID(),
      name: newFolder.name,
      color: newFolder.color
    };
    setFolders([...folders, folder]);
    setNewFolder({ name: '', color: COLORS[8] });
    setIsFolderModalOpen(false);
  };

  const handleDeleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this folder? Notes inside will be uncategorized.')) {
      setFolders(folders.filter(f => f.id !== id));
      setNotes(notes.map(n => n.folderId === id ? { ...n, folderId: undefined } : n));
      if (selectedFolderId === id) setSelectedFolderId('ALL');
    }
  };

  const activeNote = notes.find(n => n.id === selectedNoteId);
  const filteredNotes = notes.filter(n => {
    if (selectedFolderId === 'ALL') return true;
    return n.folderId === selectedFolderId;
  });

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-300">
      {/* Sidebar List */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        
        {/* Folders Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[40%] transition-colors">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
              <Folder size={16} className="text-slate-500" /> Folders
            </h2>
            <button 
              onClick={() => setIsFolderModalOpen(true)}
              className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="New Folder"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="overflow-y-auto p-2 space-y-1">
             <button
                onClick={() => setSelectedFolderId('ALL')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFolderId === 'ALL' 
                  ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white/50 dark:bg-slate-900/50" />
                All Notes
                <span className="ml-auto text-xs opacity-70">{notes.length}</span>
              </button>
             {folders.map(folder => (
               <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative ${
                  selectedFolderId === folder.id 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 ring-1 ring-blue-200 dark:ring-blue-800' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${folder.color}`} />
                <span className="truncate">{folder.name}</span>
                <span className={`ml-auto text-xs ${selectedFolderId === folder.id ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`}>
                  {notes.filter(n => n.folderId === folder.id).length}
                </span>
                
                <div onClick={(e) => handleDeleteFolder(folder.id, e)} className="absolute right-8 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Trash2 size={12} />
                </div>
              </button>
             ))}
          </div>
        </div>

        {/* Notes List Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col flex-1 overflow-hidden transition-colors">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {selectedFolderId === 'ALL' ? 'All Notes' : folders.find(f => f.id === selectedFolderId)?.name || 'Notes'}
            </h2>
            <button 
              onClick={handleCreateNote}
              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
              title="New Note"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {filteredNotes.length === 0 && (
              <div className="text-center text-slate-400 dark:text-slate-500 text-xs mt-10 p-4">
                No notes in this folder.
              </div>
            )}
            {filteredNotes.map(note => {
               const folder = folders.find(f => f.id === note.folderId);
               return (
                <div 
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border group relative ${
                    selectedNoteId === note.id 
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-medium text-sm truncate pr-6 ${selectedNoteId === note.id ? 'text-blue-800 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
                      {note.title || "Untitled"}
                    </h3>
                    <button onClick={(e) => handleDeleteNote(note.id, e)} className="text-slate-300 hover:text-red-500 absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {folder && (
                    <div className="mb-2">
                       <span className={`text-[9px] px-1.5 py-0.5 rounded-full text-white ${folder.color} opacity-80`}>
                         {folder.name}
                       </span>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate leading-relaxed">
                    {note.content || "No additional text..."}
                  </p>
                  <span className="text-[9px] text-slate-300 dark:text-slate-600 mt-2 block">
                    {new Date(note.updatedAt).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative transition-colors">
        {activeNote ? (
          <>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                 <input 
                  type="text" 
                  value={activeNote.title}
                  onChange={(e) => handleUpdateNote(activeNote.id, { title: e.target.value })}
                  className="text-2xl font-bold text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 outline-none flex-1 bg-transparent transition-colors"
                  placeholder="Note Title"
                />
                 {/* Folder Selector Dropdown */}
                 <div className="ml-4 relative group">
                    <select
                      value={activeNote.folderId || ''}
                      onChange={(e) => handleUpdateNote(activeNote.id, { folderId: e.target.value || undefined })}
                      className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer pr-8 transition-colors"
                    >
                       <option value="">Uncategorized</option>
                       {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <Folder size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
              </div>

              <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
                Last edited: {new Date(activeNote.updatedAt).toLocaleString()}
                <span className="text-green-500 flex items-center gap-1"><Save size={12}/> Saved</span>
              </div>
            </div>
            <textarea
              value={activeNote.content}
              onChange={(e) => handleUpdateNote(activeNote.id, { content: e.target.value })}
              className="flex-1 w-full p-6 outline-none text-slate-600 dark:text-slate-300 resize-none leading-relaxed text-base bg-transparent placeholder-slate-300 dark:placeholder-slate-600"
              placeholder="Write your note content here..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
              <FolderPlus size={32} />
            </div>
            <p>Select a note or create a new one.</p>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
             <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
               <h3 className="font-bold text-slate-700 dark:text-white">Create Folder</h3>
               <button onClick={() => setIsFolderModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={18}/></button>
             </div>
             <form onSubmit={handleCreateFolder} className="p-4 space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Folder Name</label>
                 <input 
                    autoFocus
                    type="text" 
                    required
                    value={newFolder.name}
                    onChange={e => setNewFolder({...newFolder, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Work Projects"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Color Code</label>
                 <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => (
                       <button
                         key={color}
                         type="button"
                         onClick={() => setNewFolder({...newFolder, color})}
                         className={`w-6 h-6 rounded-full ${color} transition-transform hover:scale-110 ${newFolder.color === color ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110' : ''}`}
                       />
                    ))}
                 </div>
               </div>
               <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mt-2 flex items-center justify-center gap-2 shadow-sm">
                 <Check size={16} /> Create Folder
               </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};