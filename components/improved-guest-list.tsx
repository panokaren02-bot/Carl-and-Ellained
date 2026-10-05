"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Star, CheckCircle, XCircle, Clock, Users as UsersIcon, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types
export type GuestStatus = 'pending' | 'confirmed' | 'declined' | 'request';

export interface Companion {
  name: string;
  relationship: string;
}

export interface Guest {
  id: string;
  name: string;
  role: string;
  email?: string;
  contact?: string;
  message?: string;
  allowedGuests: number;
  companions: Companion[];
  tableNumber: string;
  isVip: boolean;
  status: GuestStatus;
  addedBy?: string; // Track who added the guest
  createdAt?: string;
}

interface ImprovedGuestListProps {
  guests: Guest[];
  onUpdateGuest: (guest: Guest) => void;
  onDeleteGuest: (id: string) => void;
  onAddGuest: (guest: Omit<Guest, 'id'>) => Promise<void>;
}

export const ImprovedGuestList: React.FC<ImprovedGuestListProps> = ({ 
  guests, 
  onUpdateGuest, 
  onDeleteGuest, 
  onAddGuest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | GuestStatus>('all');
  const [vipFilter, setVipFilter] = useState<boolean | 'all'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedGuestName, setSavedGuestName] = useState('');
  const [operationType, setOperationType] = useState<'add' | 'edit' | 'delete'>('add');

  // Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formAllowedGuests, setFormAllowedGuests] = useState(1);
  const [formCompanions, setFormCompanions] = useState<Companion[]>([]);
  const [formTable, setFormTable] = useState('');
  const [formIsVip, setFormIsVip] = useState(false);
  const [formStatus, setFormStatus] = useState<GuestStatus>('pending');
  const [formAddedBy, setFormAddedBy] = useState('');

  // Sync companions array with allowedGuests count
  useEffect(() => {
    const companionCount = Math.max(0, formAllowedGuests - 1);
    if (formCompanions.length !== companionCount) {
      const newCompanions = [...formCompanions];
      if (newCompanions.length < companionCount) {
        // Add slots
        for (let i = newCompanions.length; i < companionCount; i++) {
          newCompanions.push({ name: '', relationship: '' });
        }
      } else {
        // Remove slots
        newCompanions.splice(companionCount);
      }
      setFormCompanions(newCompanions);
    }
  }, [formAllowedGuests]);

  // Filter guests
  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.status !== 'request' && 
      (g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       g.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (g.companions && g.companions.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))));
    
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchesVip = vipFilter === 'all' || g.isVip === vipFilter;
    
    return matchesSearch && matchesStatus && matchesVip;
  });

  const resetForm = () => {
    setFormName('');
    setFormRole('');
    setFormEmail('');
    setFormContact('');
    setFormMessage('');
    setFormAllowedGuests(1);
    setFormCompanions([]);
    setFormTable('');
    setFormIsVip(false);
    setFormStatus('pending');
    setFormAddedBy('');
    setEditingGuest(null);
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormName(guest.name);
    setFormRole(guest.role);
    setFormEmail(guest.email || '');
    setFormContact(guest.contact || '');
    setFormMessage(guest.message || '');
    setFormAllowedGuests(guest.allowedGuests);
    setFormCompanions(guest.companions || []);
    setFormTable(guest.tableNumber);
    setFormIsVip(guest.isVip);
    setFormStatus(guest.status);
    setFormAddedBy(guest.addedBy || '');
    setShowModal(true);
  };

  const handleCompanionChange = (index: number, field: keyof Companion, value: string) => {
    const updated = [...formCompanions];
    updated[index] = { ...updated[index], [field]: value };
    setFormCompanions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setOperationType(editingGuest ? 'edit' : 'add');
    
    const guestData = {
      name: formName,
      role: formRole,
      email: formEmail,
      contact: formContact,
      message: formMessage,
      allowedGuests: formAllowedGuests,
      companions: formCompanions,
      tableNumber: formTable,
      isVip: formIsVip,
      status: formStatus,
      addedBy: formAddedBy,
      createdAt: editingGuest?.createdAt || new Date().toISOString(),
    };

    try {
      if (editingGuest) {
        onUpdateGuest({ ...editingGuest, ...guestData });
      } else {
        await onAddGuest(guestData);
      }
      
      // Store guest name for success modal
      setSavedGuestName(formName);
      
      // Wait a bit for the save to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving guest:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setShowModal(false);
    resetForm();
  };

  const handleDeleteGuest = async (guest: Guest) => {
    if (!confirm(`Are you sure you want to delete ${guest.name}?`)) {
      return;
    }

    setIsSaving(true);
    setOperationType('delete');
    setSavedGuestName(guest.name);

    try {
      onDeleteGuest(guest.id);
      
      // Wait a bit for the delete to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting guest:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    // Create CSV content
    let csv = 'Name,Role,Email,Contact,Status,Allowed Guests,Table,VIP,Added By,Companions\n';
    
    filteredGuests.forEach(guest => {
      const companionsStr = guest.companions
        .map(c => `${c.name} (${c.relationship})`)
        .join('; ');
      
      csv += `"${guest.name}","${guest.role}","${guest.email || ''}","${guest.contact || ''}","${guest.status}",${guest.allowedGuests},"${guest.tableNumber}","${guest.isVip}","${guest.addedBy || ''}","${companionsStr}"\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guest-list-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: GuestStatus) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: GuestStatus) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-700 border-green-300',
      declined: 'bg-red-100 text-red-700 border-red-300',
      pending: 'bg-amber-100 text-amber-700 border-amber-300',
      request: 'bg-blue-100 text-blue-700 border-blue-300',
    };
    return colors[status] || colors.pending;
  };

  // Statistics
  const stats = {
    total: filteredGuests.length,
    confirmed: filteredGuests.filter(g => g.status === 'confirmed').length,
    pending: filteredGuests.filter(g => g.status === 'pending').length,
    declined: filteredGuests.filter(g => g.status === 'declined').length,
    vip: filteredGuests.filter(g => g.isVip).length,
    totalPax: filteredGuests.reduce((sum, g) => sum + g.allowedGuests, 0),
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 border border-[#DDE5D4] shadow-sm">
          <div className="text-2xl font-bold text-[#4F674D]">{stats.total}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Invitations</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-sm">
          <div className="text-2xl font-bold text-green-700">{stats.confirmed}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Confirmed</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 shadow-sm">
          <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Pending</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-sm">
          <div className="text-2xl font-bold text-red-700">{stats.declined}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Declined</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 shadow-sm">
          <div className="text-2xl font-bold text-purple-700">{stats.vip}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">VIP Guests</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 shadow-sm">
          <div className="text-2xl font-bold text-blue-700">{stats.totalPax}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">Total Pax</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, role, or companion..." 
            className="w-full pl-10 pr-4 py-2.5 border border-[#DDE5D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9EAF91]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-[#DDE5D4] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9EAF91] text-sm"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>

          <select 
            value={String(vipFilter)}
            onChange={(e) => setVipFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
            className="border border-[#DDE5D4] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9EAF91] text-sm"
          >
            <option value="all">All Guests</option>
            <option value="true">VIP Only</option>
            <option value="false">Regular</option>
          </select>

          <Button 
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="border-[#DDE5D4] text-[#4F674D] hover:bg-[#DDE5D4]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-[#4F674D] text-white hover:bg-[#304A34]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DDE5D4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#DDE5D4] text-[#304A34]">
              <tr>
                <th className="px-6 py-3 font-semibold uppercase text-xs">Name & Companions</th>
                <th className="px-6 py-3 font-semibold uppercase text-xs">Role</th>
                <th className="px-6 py-3 font-semibold uppercase text-xs">Contact</th>
                <th className="px-6 py-3 font-semibold uppercase text-xs text-center">Pax</th>
                <th className="px-6 py-3 font-semibold uppercase text-xs text-center">Table</th>
                <th className="px-6 py-3 font-semibold uppercase text-xs text-center">Status</th>
                <th className="px-6 py-3 font-semibold uppercase text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5D4]">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No guests found matching your filters</p>
                  </td>
                </tr>
              ) : (
                filteredGuests.map(guest => (
                  <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          {guest.isVip && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                          <span className="font-medium text-gray-800">{guest.name}</span>
                        </div>
                        {guest.companions && guest.companions.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {guest.companions.map((c, i) => (
                              <div key={i} className="flex items-center space-x-1 text-[10px] text-[#4F674D] italic leading-tight">
                                <UsersIcon className="w-2.5 h-2.5" />
                                <span>{c.name || 'Unnamed'} ({c.relationship || 'Companion'})</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {guest.addedBy && (
                          <div className="mt-1 text-[9px] text-gray-400">Added by: {guest.addedBy}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{guest.role}</td>
                    <td className="px-6 py-4 text-xs">
                      {guest.email && <div className="text-gray-600">{guest.email}</div>}
                      {guest.contact && <div className="text-gray-500">{guest.contact}</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-[#4F674D]">{guest.allowedGuests}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">
                        {guest.tableNumber || 'TBD'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(guest.status)} flex items-center gap-1`}>
                          {getStatusIcon(guest.status)}
                          <span className="capitalize">{guest.status}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => handleEdit(guest)} 
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit guest"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteGuest(guest)} 
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete guest"
                          disabled={isSaving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl my-8 relative">
            {/* Loading Overlay */}
            {isSaving && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-[#DDE5D4] border-t-[#4F674D] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg font-semibold text-[#4F674D]">Saving Guest...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait while we save the information</p>
                </div>
              </div>
            )}

            <div className="p-6 border-b border-[#DDE5D4] flex justify-between items-center bg-[#FBFCF7] sticky top-0 z-20">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#304A34]">
                  {editingGuest ? 'Edit Invitation' : 'Create Invitation'}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Only Full Name and Attendance/RSVP are required. Other details can be filled later.
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSaving}
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Primary Guest Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#4F674D] uppercase border-b border-[#DDE5D4] pb-2">
                    Primary Guest Information
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        required 
                        value={formName} 
                        onChange={e => setFormName(e.target.value)} 
                        type="text" 
                        placeholder="Enter guest's full name"
                        className="w-full border border-[#DDE5D4] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9EAF91] outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                        Role/Relationship
                      </label>
                      <input 
                        value={formRole} 
                        onChange={e => setFormRole(e.target.value)} 
                        type="text" 
                        placeholder="e.g., Friend, Family, Colleague (optional)"
                        className="w-full border border-[#DDE5D4] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9EAF91] outline-none" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Email</label>
                        <input 
                          value={formEmail} 
                          onChange={e => setFormEmail(e.target.value)} 
                          type="email" 
                          placeholder="email@example.com"
                          className="w-full border border-[#DDE5D4] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9EAF91] outline-none" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Contact</label>
                        <input 
                          value={formContact} 
                          onChange={e => setFormContact(e.target.value)} 
                          type="text" 
                          placeholder="+1234567890"
                          className="w-full border border-[#DDE5D4] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9EAF91] outline-none" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Added By</label>
                      <input 
                        value={formAddedBy} 
                        onChange={e => setFormAddedBy(e.target.value)} 
                        type="text" 
                        placeholder="e.g., Bride, Groom, Family"
                        className="w-full border border-[#DDE5D4] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9EAF91] outline-none" 
                      />
                      <p className="text-[10px] text-gray-400">Track who added this guest to the list</p>
                    </div>
                  </div>
                </div>

                {/* Attendance & RSVP Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#4F674D] uppercase border-b border-[#DDE5D4] pb-2">
                    Attendance & RSVP
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                        Allowed Pax (Including Primary Guest)
                      </label>
                      <input 
                        min="1" 
                        max="20"
                        value={formAllowedGuests} 
                        onChange={e => setFormAllowedGuests(parseInt(e.target.value) || 1)} 
                        type="number" 
                        className="w-full border border-[#DDE5D4] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9EAF91] outline-none font-bold text-lg text-[#4F674D]" 
                      />
                      <p className="text-[10px] text-gray-400">Total number of people this guest can bring (default: 1)</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                        RSVP Status <span className="text-red-500">*</span>
                      </label>
                      <select 
                        value={formStatus} 
                        onChange={e => setFormStatus(e.target.value as GuestStatus)} 
                        className="w-full border border-[#DDE5D4] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9EAF91] outline-none"
                      >
                        <option value="pending">⏳ Waiting for Response</option>
                        <option value="confirmed">✅ Attendance Confirmed</option>
                        <option value="declined">❌ Cannot Attend</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Table Number</label>
                        <input 
                          value={formTable} 
                          onChange={e => setFormTable(e.target.value)} 
                          type="text" 
                          placeholder="e.g., T1, VIP-A"
                          className="w-full border border-[#DDE5D4] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9EAF91] outline-none" 
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-7">
                        <input 
                          id="vip-check" 
                          type="checkbox" 
                          checked={formIsVip} 
                          onChange={e => setFormIsVip(e.target.checked)} 
                          className="w-4 h-4 text-[#4F674D] border-gray-300 rounded focus:ring-[#9EAF91]" 
                        />
                        <label htmlFor="vip-check" className="text-xs font-bold text-[#304A34] cursor-pointer flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          VIP Guest
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Companion Inputs */}
              {formAllowedGuests > 1 && (
                <div className="bg-[#FBFCF7] p-5 rounded-xl border border-[#DDE5D4] space-y-4">
                  <div className="flex items-center space-x-2 text-[#4F674D]">
                    <UsersIcon className="w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-tight">
                      Additional Guests ({formAllowedGuests - 1} {formAllowedGuests - 1 === 1 ? 'slot' : 'slots'})
                    </h3>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Optional: Provide names and relationships for additional guests. These can be filled in later after the guest confirms their RSVP.
                  </p>
                  
                  <div className="space-y-4">
                    {formCompanions.map((comp, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4 border-b border-[#DDE5D4] last:border-0 last:pb-0">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Guest {idx + 2} Full Name
                          </label>
                          <input 
                            value={comp.name} 
                            onChange={e => handleCompanionChange(idx, 'name', e.target.value)} 
                            placeholder={`Full name of guest ${idx + 2} (optional)`}
                            type="text" 
                            className="w-full border border-[#DDE5D4] rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#9EAF91] outline-none text-sm" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Relationship with {formName || 'Primary Guest'}
                          </label>
                          <input 
                            value={comp.relationship} 
                            onChange={e => handleCompanionChange(idx, 'relationship', e.target.value)} 
                            placeholder="e.g., Spouse, Friend, Child (optional)"
                            type="text" 
                            className="w-full border border-[#DDE5D4] rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#9EAF91] outline-none text-sm" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Message */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                  Personal Message to the Couple
                </label>
                <textarea 
                  value={formMessage} 
                  onChange={e => setFormMessage(e.target.value)} 
                  rows={4} 
                  placeholder="Share your excitement, well wishes, or any special message..."
                  className="w-full border border-[#DDE5D4] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9EAF91] outline-none resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-[#DDE5D4]">
                <Button 
                  type="button" 
                  onClick={() => { setShowModal(false); resetForm(); }}
                  variant="outline"
                  className="px-8 py-2 border-[#DDE5D4] text-gray-600 hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="px-10 py-2 bg-[#4F674D] text-white hover:bg-[#304A34] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    editingGuest ? 'Update Invitation' : 'Send Invitation'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-3" strokeWidth={2} />
              <h3 className="text-2xl font-bold font-serif">Success!</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-lg text-gray-700 mb-2">
                <span className="font-semibold text-[#4F674D]">{savedGuestName}</span> has been successfully {operationType === 'delete' ? 'deleted' : operationType === 'edit' ? 'updated' : 'added'}!
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {operationType === 'delete' 
                  ? 'The guest has been removed from your list.' 
                  : 'The guest information has been saved and is now visible in your dashboard.'}
              </p>
              <Button 
                onClick={handleSuccessModalClose}
                className="w-full bg-[#4F674D] text-white hover:bg-[#304A34] py-3 text-base font-semibold"
              >
                Perfect! Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Loading Modal (for delete operations) */}
      {isSaving && !showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#DDE5D4] border-t-[#4F674D] rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-[#304A34] mb-2">
                {operationType === 'delete' ? 'Deleting Guest' : 'Processing'}...
              </h3>
              <p className="text-sm text-gray-500">Please wait while we process your request</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

