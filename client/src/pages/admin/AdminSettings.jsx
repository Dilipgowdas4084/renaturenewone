import React from 'react';

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-stone-400">Manage your admin preferences and system settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Profile Settings</h2>
          <div className="text-stone-400 flex items-center justify-center h-32 border border-dashed border-white/[0.1] rounded-xl">
            Coming Soon
          </div>
        </div>
        
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Notification Settings</h2>
          <div className="text-stone-400 flex items-center justify-center h-32 border border-dashed border-white/[0.1] rounded-xl">
            Coming Soon
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 md:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4">System Settings</h2>
          <div className="text-stone-400 flex items-center justify-center h-32 border border-dashed border-white/[0.1] rounded-xl">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
