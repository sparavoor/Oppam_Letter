'use client';

import React, { useState, useTransition } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  FileDown, 
  Printer, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  TrendingUp, 
  Calendar,
  X,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { updateLetterStatusAction, deleteLetterAction } from '../app/actions';

interface Letter {
  id: number;
  reference_id: string;
  name: string;
  mobile: string;
  location: string;
  subject: string | null;
  letter_content: string;
  status: 'Pending' | 'Reviewed' | 'Resolved';
  created_at: string;
}

interface LettersDashboardProps {
  initialLetters: Letter[];
}

export default function LettersDashboard({ initialLetters }: LettersDashboardProps) {
  const [letters, setLetters] = useState<Letter[]>(initialLetters);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<number | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');

  const [isPending, startTransition] = useTransition();

  // 1. Calculate Statistics
  const totalLetters = letters.length;
  const pendingCount = letters.filter(l => l.status === 'Pending').length;
  const reviewedCount = letters.filter(l => l.status === 'Reviewed').length;
  const resolvedCount = letters.filter(l => l.status === 'Resolved').length;

  // 2. Calculate Daily Submissions (Last 7 Days)
  const getDailyStats = () => {
    const stats: { [key: string]: number } = {};
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      stats[label] = 0;
    }

    // Populate counts
    letters.forEach(letter => {
      const dateLabel = new Date(letter.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (stats[dateLabel] !== undefined) {
        stats[dateLabel] += 1;
      }
    });

    return Object.entries(stats).map(([day, count]) => ({ day, count }));
  };

  const dailyStats = getDailyStats();
  const maxDayCount = Math.max(...dailyStats.map(d => d.count), 1);

  // 3. Extract unique subjects for filter dropdown
  const uniqueSubjects = Array.from(
    new Set(letters.map(l => l.subject?.trim()).filter(Boolean))
  ) as string[];

  // 4. Filtering Logic
  const filteredLetters = letters.filter(letter => {
    const matchesSearch = 
      letter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.mobile.includes(searchQuery) ||
      letter.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.reference_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || letter.status === statusFilter;
    
    const matchesSubject = 
      subjectFilter === 'All' || 
      (letter.subject && letter.subject.trim() === subjectFilter);

    return matchesSearch && matchesStatus && matchesSubject;
  });

  // 5. Actions: Update Status
  const handleUpdateStatus = (id: number, newStatus: 'Pending' | 'Reviewed' | 'Resolved') => {
    startTransition(async () => {
      const success = await updateLetterStatusAction(id, newStatus);
      if (success) {
        setLetters(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
        // Update currently open drawer letter too
        if (selectedLetter && selectedLetter.id === id) {
          setSelectedLetter(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    });
  };

  // 6. Actions: Delete Letter
  const handleDeleteConfirm = () => {
    if (letterToDelete === null) return;
    
    startTransition(async () => {
      const success = await deleteLetterAction(letterToDelete);
      if (success) {
        setLetters(prev => prev.filter(l => l.id !== letterToDelete));
        setIsDrawerOpen(false);
        setSelectedLetter(null);
      }
      setShowDeleteModal(false);
      setLetterToDelete(null);
    });
  };

  // 7. Action: Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Reference ID', 'Student Name', 'Mobile Number', 'Location', 'Subject', 'Status', 'Submission Date'];
    const rows = filteredLetters.map(letter => [
      letter.id,
      letter.reference_id,
      letter.name,
      letter.mobile,
      letter.location,
      letter.subject || 'N/A',
      letter.status,
      new Date(letter.created_at).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `letters_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 8. Action: Print Letter (Formally structured)
  const handlePrintLetter = (letter: Letter) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Letter Print - ${letter.reference_id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .reference { float: right; font-weight: bold; font-family: monospace; }
            .title { font-size: 20px; font-weight: bold; margin: 0; color: #1e3a8a; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .meta-item { font-size: 13px; }
            .meta-label { font-weight: bold; color: #64748b; }
            .content-box { border: 1px solid #e2e8f0; padding: 30px; border-radius: 8px; background: #fff; min-height: 300px; white-space: pre-wrap; font-size: 14px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 20px; }
              .meta-grid { background: none; border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="reference">Ref ID: ${letter.reference_id}</span>
            <h1 class="title">ഒപ്പം (Oppam) Form Portal</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Official Submitted Application Record</p>
          </div>
          
          <div class="meta-grid">
            <div class="meta-item"><span class="meta-label">Student Name:</span> ${letter.name}</div>
            <div class="meta-item"><span class="meta-label">Submission Date:</span> ${new Date(letter.created_at).toLocaleString()}</div>
            <div class="meta-item"><span class="meta-label">Mobile Number:</span> ${letter.mobile}</div>
            <div class="meta-item"><span class="meta-label">Location / Place:</span> ${letter.location}</div>
            <div class="meta-item" style="grid-column: span 2;"><span class="meta-label">Subject:</span> ${letter.subject || 'Not Provided'}</div>
          </div>

          <div style="font-weight: bold; margin-bottom: 10px; font-size: 14px; color: #1e3a8a;">LETTER CONTENT</div>
          <div class="content-box">${letter.letter_content}</div>

          <div class="footer">
            Generated officially via Oppam Student Support Portal. Record integrity secured under SQLite storage.
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex-1 p-6 md:p-10 space-y-8 bg-slate-50 overflow-y-auto">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Real-time Monitoring
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500">
            Monitor and manage letters submitted by students.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredLetters.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 font-semibold border border-slate-200 rounded-xl shadow-sm text-xs transition-all duration-200"
          >
            <FileDown className="h-4 w-4" />
            <span>Export Filtered (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Stat Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-500"></div>
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Received</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalLetters}</h3>
          </div>
        </div>

        {/* Pending Stat Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500"></div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Action</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{pendingCount}</h3>
          </div>
        </div>

        {/* Reviewed Stat Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-500"></div>
          <div className="p-3 bg-blue-50 text-blue-50 rounded-xl">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reviewed</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{reviewedCount}</h3>
          </div>
        </div>

        {/* Resolved Stat Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all duration-200">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500"></div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{resolvedCount}</h3>
          </div>
        </div>

      </div>

      {/* 3. Analytics Chart Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Daily Submission Count (Last 7 Days)
          </h2>
        </div>

        {/* CSS Chart */}
        <div className="h-44 flex items-end justify-between gap-2 md:gap-6 pt-4 border-b border-slate-100">
          {dailyStats.map(({ day, count }) => {
            const pct = (count / maxDayCount) * 100;
            return (
              <div key={day} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                {/* Bar Count Tooltip */}
                <span className="absolute bottom-full mb-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {count} Letters
                </span>
                
                {/* Visual Bar */}
                <div 
                  style={{ height: `${Math.max(pct, 5)}%` }} 
                  className={`w-full max-w-[45px] rounded-t-lg transition-all duration-500 cursor-pointer ${
                    count > 0 
                      ? 'bg-gradient-to-t from-indigo-650 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-sm shadow-indigo-600/10' 
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                ></div>

                {/* Day label */}
                <span className="text-[10px] font-bold text-slate-400 mt-3 truncate max-w-full text-center">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Filters & Letters Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Search & Filter Header bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/50">
          
          {/* Search box */}
          <div className="relative w-full lg:max-w-xs shadow-sm rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search Name, Mobile, Location, Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/5 transition-all duration-200 text-xs"
            />
          </div>

          {/* Filters Select boxes */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Status Filter */}
            <div className="flex items-center gap-2 text-xs flex-1 sm:flex-initial">
              <span className="text-slate-400 font-medium whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full bg-white border border-slate-200 rounded-xl py-2 pl-3 pr-8 focus:border-indigo-500 focus:outline-none text-xs"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-2 text-xs flex-1 sm:flex-initial">
              <span className="text-slate-400 font-medium whitespace-nowrap">Subject:</span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="block w-full bg-white border border-slate-200 rounded-xl py-2 pl-3 pr-8 focus:border-indigo-500 focus:outline-none text-xs max-w-[200px]"
              >
                <option value="All">All Subjects</option>
                {uniqueSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* Table data container */}
        <div className="overflow-x-auto">
          {filteredLetters.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="h-14 w-14 rounded-full bg-slate-50 text-slate-350 flex items-center justify-center mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No submissions found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Try adjusting your search query or filters to locate the specific record.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-450">
                  <th className="py-4 px-6 w-12 text-center">ID</th>
                  <th className="py-4 px-6">Reference ID</th>
                  <th className="py-4 px-6">Student Details</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-6">Submitted At</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLetters.map(letter => {
                  let statusBadge = '';
                  if (letter.status === 'Pending') {
                    statusBadge = 'bg-amber-50 text-amber-700 border-amber-100';
                  } else if (letter.status === 'Reviewed') {
                    statusBadge = 'bg-blue-50 text-blue-700 border-blue-100';
                  } else {
                    statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  }

                  return (
                    <tr 
                      key={letter.id} 
                      className={`hover:bg-slate-50/50 transition-colors duration-150 ${
                        selectedLetter?.id === letter.id ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-bold text-slate-400 text-center">{letter.id}</td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-800 tracking-wider">
                        {letter.reference_id}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{letter.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{letter.mobile}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium">{letter.location}</td>
                      <td className="py-4 px-6 font-semibold text-slate-700 truncate max-w-[150px]">
                        {letter.subject || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-slate-400 font-medium">
                        {new Date(letter.created_at).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                          {letter.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="View Letter"
                            onClick={() => {
                              setSelectedLetter(letter);
                              setIsDrawerOpen(true);
                            }}
                            className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg border border-transparent hover:border-indigo-100 transition-all duration-200"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            title="Delete Record"
                            onClick={() => {
                              setLetterToDelete(letter.id);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* 5. Sliding Drawer Detail Panel */}
      {isDrawerOpen && selectedLetter && (
        <div className="fixed inset-0 z-45 overflow-hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
          ></div>
          
          {/* Panel */}
          <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full z-10 animate-slide-in">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono tracking-widest text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                  Ref: {selectedLetter.reference_id}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  Student Submission Profile
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-slate-250 text-slate-400 hover:text-slate-600 rounded-full transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200/65 rounded-2xl p-5 text-xs text-slate-600">
                <div>
                  <span className="font-bold text-slate-400 block uppercase text-[10px]">Student Name</span>
                  <span className="font-black text-slate-900 text-sm mt-0.5 block">{selectedLetter.name}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block uppercase text-[10px]">Submission Date</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {new Date(selectedLetter.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block uppercase text-[10px]">Mobile Contact</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedLetter.mobile}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 block uppercase text-[10px]">Location / Place</span>
                  <span className="font-bold text-slate-850 mt-0.5 block">{selectedLetter.location}</span>
                </div>
                <div className="col-span-2 border-t border-slate-200/50 pt-3 mt-1">
                  <span className="font-bold text-slate-400 block uppercase text-[10px]">Subject</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                    {selectedLetter.subject || 'Not Provided'}
                  </span>
                </div>
              </div>

              {/* Status Update Quick Bar */}
              <div className="border border-slate-200/65 rounded-2xl p-5 bg-white">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-3">Status Management</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedLetter.id, 'Pending')}
                    disabled={isPending}
                    className={`flex-1 py-2 px-3 border rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      selectedLetter.status === 'Pending' 
                        ? 'bg-amber-50 text-amber-700 border-amber-300' 
                        : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>Pending</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedLetter.id, 'Reviewed')}
                    disabled={isPending}
                    className={`flex-1 py-2 px-3 border rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      selectedLetter.status === 'Reviewed' 
                        ? 'bg-blue-50 text-blue-700 border-blue-300' 
                        : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Reviewed</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedLetter.id, 'Resolved')}
                    disabled={isPending}
                    className={`flex-1 py-2 px-3 border rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      selectedLetter.status === 'Resolved' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                        : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Resolved</span>
                  </button>
                </div>
              </div>

              {/* Letter Content Display (Paper Styled Card) */}
              <div className="space-y-2">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Submitted Letter Content</span>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 md:p-8 min-h-[250px] shadow-inner font-serif text-slate-800 text-sm whitespace-pre-wrap leading-relaxed relative overflow-hidden">
                  
                  {/* Watermark/Decorations */}
                  <div className="absolute top-0 right-0 opacity-[0.02] text-slate-900 pointer-events-none select-none text-9xl font-extrabold rotate-[25deg]">
                    ഒ
                  </div>

                  {selectedLetter.letter_content}
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              
              <button
                onClick={() => handlePrintLetter(selectedLetter)}
                className="flex items-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs shadow-sm transition-all duration-200"
              >
                <Printer className="h-4 w-4" />
                <span>Print / PDF Document</span>
              </button>

              <button
                onClick={() => {
                  setLetterToDelete(selectedLetter.id);
                  setShowDeleteModal(true);
                }}
                disabled={isPending}
                className="flex items-center gap-2 py-2.5 px-4 bg-red-550 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-xl text-xs shadow-md shadow-red-500/10 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Permanent</span>
              </button>
              
            </div>

          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"></div>
          
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative z-10 border border-slate-100 flex flex-col items-center text-center animate-bounce-in">
            <div className="h-12 w-12 rounded-full bg-red-50 text-red-550 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            
            <h3 className="text-lg font-black text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 mt-2 px-2">
              Are you absolutely sure you want to delete this submitted letter? This action will erase the record from database permanently.
            </p>

            <div className="flex gap-3 w-full mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setLetterToDelete(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="flex-1 py-2.5 bg-red-550 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-xl text-xs shadow-md shadow-red-500/10 transition-colors duration-200 flex items-center justify-center gap-1.5"
              >
                {isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
