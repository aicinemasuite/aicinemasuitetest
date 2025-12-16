
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { Button } from './Button';
import { UserProfile } from '../types';

interface ProfileViewProps {
  onBack: () => void;
  user: UserProfile | null;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack, user, onUpdateUser }) => {
  const [credits, setCredits] = useState(user?.credits || 0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: user?.name || "Guest",
    email: user?.email || "guest@studio.com",
    phone: user?.phone || "+91 00000 00000"
  });

  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.name,
        email: user.email,
        phone: user.phone || "+91 00000 00000"
      });
      setCredits(user.credits);
    }
  }, [user]);

  // Password Reset State
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const clients = [
    { name: "John Doe", project: "The Last Monsoon", status: "In Progress", date: "2 days ago" },
    { name: "Sarah Smith", project: "Cyber Kerala 2077", status: "Completed", date: "1 week ago" },
    { name: "Rajeev Menon", project: "Silent Waters", status: "Draft", date: "3 weeks ago" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
     onUpdateUser({
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone
     });
     setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (newPass !== confirmPass) {
       alert("New passwords do not match!");
       return;
    }
    if (newPass.length < 6) {
       alert("Password must be at least 6 characters.");
       return;
    }
    
    // Check current password logic (Mocked via localStorage)
    const storedPass = localStorage.getItem('cinepitch_user_password') || '123456';
    if (currentPass !== storedPass) {
       alert("Incorrect current password.");
       return;
    }

    // Save new password locally
    localStorage.setItem('cinepitch_user_password', newPass);
    
    alert("Password updated successfully!");
    setShowPasswordReset(false);
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center text-zinc-500 hover:text-white mb-6 transition-colors">
          <ICONS.ChevronLeft size={20} className="mr-1" /> Back to Studio
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* LEFT COL: PROFILE & CREDITS */}
          <div className="col-span-1 space-y-6">
             
             {/* Profile Card */}
             <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                   <button onClick={() => setIsEditing(!isEditing)} className="text-zinc-500 hover:text-white"><ICONS.Settings size={16}/></button>
                </div>
                
                <div className="relative group cursor-pointer mb-4">
                   <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl overflow-hidden border-2 border-zinc-800">
                      {profileImage ? <img src={profileImage} className="w-full h-full object-cover" /> : userInfo.name.charAt(0)}
                   </div>
                   <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ICONS.Camera className="text-white" size={24}/>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
                   </label>
                </div>

                {isEditing ? (
                   <div className="w-full space-y-2">
                      <input className="w-full bg-zinc-950 border border-zinc-700 rounded p-1 text-center text-sm text-white" value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}/>
                      <input className="w-full bg-zinc-950 border border-zinc-700 rounded p-1 text-center text-xs text-zinc-400" value={userInfo.email} onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}/>
                      <input className="w-full bg-zinc-950 border border-zinc-700 rounded p-1 text-center text-xs text-zinc-400" value={userInfo.phone} onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}/>
                      <Button variant="accent" className="w-full text-xs mt-2" onClick={handleSaveChanges}>Save Changes</Button>
                   </div>
                ) : (
                   <>
                      <h2 className="text-xl font-bold text-white mb-1">{userInfo.name}</h2>
                      <p className="text-zinc-400 text-sm">{userInfo.email}</p>
                      <p className="text-zinc-500 text-xs mt-1">{userInfo.phone}</p>
                      <span className={`mt-3 px-3 py-1 ${user?.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'} text-xs font-bold rounded-full border`}>
                        {user?.role === 'ADMIN' ? 'ADMIN' : 'PRO MEMBER'}
                      </span>
                   </>
                )}
             </div>

             {/* Credits Wallet */}
             <div className="bg-gradient-to-br from-amber-900/40 to-zinc-900 border border-amber-600/30 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                   <ICONS.Zap size={100} className="text-amber-500"/>
                </div>
                <h3 className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">Credits Balance</h3>
                <div className="flex items-baseline gap-1 mb-4">
                   <span className="text-4xl font-bold text-white">{credits.toLocaleString()}</span>
                   <span className="text-amber-500 text-sm font-bold">CR</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-4">
                   <div className="bg-amber-500 h-1.5 rounded-full w-[75%]"></div>
                </div>
                <div className="flex gap-2">
                   <Button variant="accent" className="flex-1 text-xs" onClick={() => setCredits(credits + 1000)}>Buy Credits</Button>
                   <button className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300 transition-colors">History</button>
                </div>
             </div>

             {/* Security Section */}
             <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-4 flex items-center gap-2"><ICONS.ShieldCheck size={14}/> Security</h3>
                
                {showPasswordReset ? (
                   <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div>
                         <label className="text-[10px] text-zinc-500 uppercase block mb-1">Current Password</label>
                         <input type="password" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)}/>
                      </div>
                      <div>
                         <label className="text-[10px] text-zinc-500 uppercase block mb-1">New Password</label>
                         <input type="password" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs" value={newPass} onChange={(e) => setNewPass(e.target.value)}/>
                      </div>
                      <div>
                         <label className="text-[10px] text-zinc-500 uppercase block mb-1">Confirm New Password</label>
                         <input type="password" className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}/>
                      </div>
                      <div className="flex gap-2 pt-2">
                         <Button variant="accent" className="flex-1 text-xs" onClick={handleChangePassword}>Update</Button>
                         <Button variant="secondary" className="text-xs" onClick={() => setShowPasswordReset(false)}>Cancel</Button>
                      </div>
                   </div>
                ) : (
                   <div className="flex flex-col gap-2">
                      <Button variant="secondary" className="w-full text-xs justify-start" onClick={() => setShowPasswordReset(true)}>
                         <ICONS.Settings size={14} className="mr-2"/> Change Password
                      </Button>
                      <Button variant="secondary" className="w-full text-xs justify-start text-red-400 hover:text-red-300">
                         <ICONS.LogOut size={14} className="mr-2"/> Sign out of all devices
                      </Button>
                   </div>
                )}
             </div>

          </div>

          {/* RIGHT COL: STATS & PROJECTS */}
          <div className="col-span-1 md:col-span-2 space-y-6">
             
             {/* Stats Grid */}
             <div className="grid grid-cols-3 gap-4">
               <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                 <ICONS.Briefcase className="text-blue-500 mb-2" size={20} />
                 <div>
                    <h3 className="text-2xl font-bold text-white">12</h3>
                    <p className="text-zinc-500 text-xs">Active Projects</p>
                 </div>
               </div>
               <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                  <ICONS.Image className="text-purple-500 mb-2" size={20} />
                  <div>
                     <h3 className="text-2xl font-bold text-white">842</h3>
                     <p className="text-zinc-500 text-xs">Images Generated</p>
                  </div>
               </div>
               <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
                  <ICONS.Activity className="text-green-500 mb-2" size={20} />
                  <div>
                     <h3 className="text-2xl font-bold text-white">98%</h3>
                     <p className="text-zinc-500 text-xs">Completion Rate</p>
                  </div>
               </div>
             </div>

             {/* Recent Projects Table */}
             <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
               <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                  <h3 className="font-bold text-white">Recent Client Projects</h3>
                  <button className="text-xs text-amber-500 hover:text-amber-400">View All</button>
               </div>
               <table className="w-full text-left text-sm text-zinc-400">
                 <thead className="bg-zinc-950/50 text-zinc-500 uppercase font-bold text-xs">
                   <tr>
                     <th className="p-4">Client Name</th>
                     <th className="p-4">Project Title</th>
                     <th className="p-4">Status</th>
                     <th className="p-4">Last Edited</th>
                     <th className="p-4 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800">
                   {clients.map((c, i) => (
                     <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                       <td className="p-4 font-medium text-white">{c.name}</td>
                       <td className="p-4">{c.project}</td>
                       <td className="p-4">
                         <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                           c.status === 'Completed' ? 'bg-green-900/20 text-green-400 border-green-900' :
                           c.status === 'In Progress' ? 'bg-amber-900/20 text-amber-400 border-amber-900' :
                           'bg-zinc-800 text-zinc-400 border-zinc-700'
                         }`}>
                           {c.status}
                         </span>
                       </td>
                       <td className="p-4">{c.date}</td>
                       <td className="p-4 text-right">
                         <button className="text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs transition-colors">Open</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};
