import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Guide', resource_url: '', image_url: '', tags: '' });

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resources');
      setResources(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenModal = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        description: resource.description || '',
        category: resource.category || 'Guide',
        resource_url: resource.resource_url || '',
        image_url: resource.image_url || '',
        tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : (resource.tags || '')
      });
    } else {
      setEditingResource(null);
      setFormData({ title: '', description: '', category: 'Guide', resource_url: '', image_url: '', tags: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };
      
      if (editingResource) {
        await api.put(`/resources/${editingResource.id}`, payload);
      } else {
        await api.post('/resources', payload);
      }
      setModalOpen(false);
      fetchResources();
    } catch (err) {
      console.error('Failed to save resource:', err);
      alert('Failed to save resource');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await api.delete(`/resources/${id}`);
        fetchResources();
      } catch (err) {
        console.error('Failed to delete resource:', err);
        alert('Failed to delete resource');
      }
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading resources..." />;

  const inputClass = "w-full px-4 py-2 bg-slate-900 border border-white/[0.06] rounded-xl text-stone-200 focus:outline-none focus:border-[#86efac]/50";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Resources</h1>
          <p className="text-stone-400">Manage educational materials and links.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-[#86efac] hover:bg-[#a7f3d0] text-black font-semibold rounded-xl transition-all">
          <Plus size={18} /> Add Resource
        </button>
      </div>

      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-white/[0.04] text-stone-400 text-sm">
              <th className="py-4 px-6 font-medium">Title</th>
              <th className="py-4 px-6 font-medium">Category</th>
              <th className="py-4 px-6 font-medium">Link</th>
              <th className="py-4 px-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((res) => (
              <tr key={res.id} className="border-b border-white/[0.04]">
                <td className="py-4 px-6 text-stone-200">{res.title}</td>
                <td className="py-4 px-6 text-stone-400">{res.category}</td>
                <td className="py-4 px-6">
                  {res.resource_url && (
                    <a href={res.resource_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 text-sm">
                      Open <ExternalLink size={14} />
                    </a>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(res)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(res.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {resources.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-stone-500">No resources found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingResource ? "Edit Resource" : "Add Resource"}>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-stone-400 mb-1">Title</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-stone-400 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={inputClass} rows={2} />
          </div>
          <div>
            <label className="block text-sm text-stone-400 mb-1">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={inputClass}>
              <option>Guide</option>
              <option>Video</option>
              <option>Document</option>
              <option>Link</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-stone-400 mb-1">External URL</label>
            <input type="url" value={formData.resource_url} onChange={e => setFormData({...formData, resource_url: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-stone-400 mb-1">Image URL</label>
            <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-stone-400 mb-1">Tags (comma separated)</label>
            <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className={inputClass} placeholder="nature, recycling, tips" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-white/[0.08] text-stone-300 rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[#86efac] text-black font-semibold rounded-xl">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminResources;
