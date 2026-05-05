'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Settings, 
  Bell, 
  LogOut, 
  Smartphone, 
  Lock, 
  Eye, 
  QrCode,
  Download,
  Share2,
  ExternalLink,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function PatientProfilePage() {
  const router = useRouter();
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Augusto Mendes',
    nid: '8832-1102-44',
    email: 'a.mendes@email.mz',
    phone: '+258 84 123 4567',
    address: 'Av. Eduardo Mondlane, Maputo',
    photoUrl: 'https://picsum.photos/seed/patient/400',
    nokName: 'Fátima Mendes',
    nokRelation: 'Spouse',
    nokPhone: '+258 82 987 6543'
  });

  useEffect(() => {
    const storedProfile = localStorage.getItem('patient_profile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    } else {
      // Fallback to basic storage if only name/nid exist from login
      const storedName = localStorage.getItem('patient_name');
      const storedNid = localStorage.getItem('patient_nid');
      if (storedName || storedNid) {
        setProfile(prev => ({
          ...prev,
          name: storedName || prev.name,
          nid: storedNid || prev.nid
        }));
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('patient_profile', JSON.stringify(profile));
    localStorage.setItem('patient_name', profile.name); // Sync for other pages
    setIsEditing(false);
    toast({
      title: t('patientPortal.profile.success'),
      description: "Cloud registry updated via satellite sync window."
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('patient_nid');
    localStorage.removeItem('patient_name');
    router.push('/patient-portal/login');
  };

  if (isEditing) {
    return (
      <div className="p-4 space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('patientPortal.profile.edit')}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
           {/* Section: Personal */}
           <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                 <User className="h-3 w-3" /> {t('patientPortal.profile.personalInfo')}
              </h3>
              <Card className="p-4 space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Full Name</label>
                    <Input 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="bg-slate-50/50"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Profile Picture URL</label>
                    <Input 
                      value={profile.photoUrl} 
                      onChange={(e) => setProfile({...profile, photoUrl: e.target.value})}
                      className="bg-slate-50/50"
                      placeholder="https://..."
                    />
                 </div>
              </Card>
           </div>

           {/* Section: Contact */}
           <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                 <Phone className="h-3 w-3" /> {t('patientPortal.profile.contactInfo')}
              </h3>
              <Card className="p-4 space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">{t('patientPortal.profile.email')}</label>
                    <Input 
                      type="email"
                      value={profile.email} 
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="bg-slate-50/50"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">{t('patientPortal.profile.phone')}</label>
                    <Input 
                      value={profile.phone} 
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="bg-slate-50/50"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">{t('patientPortal.profile.address')}</label>
                    <Input 
                      value={profile.address} 
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      className="bg-slate-50/50"
                    />
                 </div>
              </Card>
           </div>

           {/* Section: Next of Kin */}
           <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                 <Heart className="h-3 w-3" /> {t('patientPortal.profile.nextOfKin')}
              </h3>
              <Card className="p-4 space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">{t('patientPortal.profile.nokName')}</label>
                    <Input 
                      value={profile.nokName} 
                      onChange={(e) => setProfile({...profile, nokName: e.target.value})}
                      className="bg-slate-50/50"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase text-slate-400">{t('patientPortal.profile.nokRelation')}</label>
                       <Input 
                         value={profile.nokRelation} 
                         onChange={(e) => setProfile({...profile, nokRelation: e.target.value})}
                         className="bg-slate-50/50"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold uppercase text-slate-400">{t('patientPortal.profile.nokPhone')}</label>
                       <Input 
                         value={profile.nokPhone} 
                         onChange={(e) => setProfile({...profile, nokPhone: e.target.value})}
                         className="bg-slate-50/50"
                       />
                    </div>
                 </div>
              </Card>
           </div>

           <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 h-12 font-bold" onClick={() => setIsEditing(false)}>
                 {t('patientPortal.profile.cancel')}
              </Button>
              <Button className="flex-1 h-12 font-bold bg-primary" onClick={handleSave}>
                 <Save className="h-4 w-4 mr-2" />
                 {t('patientPortal.profile.save')}
              </Button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t('patientPortal.nav.profile')}
        </h2>
        <Button variant="outline" size="sm" className="bg-white" onClick={() => setIsEditing(true)}>
           <Edit className="h-4 w-4 mr-2" />
           {t('patientPortal.profile.edit')}
        </Button>
      </div>

      {/* User Card */}
      <div className="flex flex-col items-center py-6 space-y-4 bg-white rounded-2xl shadow-sm border border-slate-100">
         <div className="relative group">
            <div className="h-24 w-24 rounded-full border-4 border-primary/10 overflow-hidden relative">
               <Image 
                 src={profile.photoUrl} 
                 alt="User" 
                 width={96} 
                 height={96} 
                 className="object-cover"
                 referrerPolicy="no-referrer"
               />
               <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white" onClick={() => setIsEditing(true)}>
                  <Edit className="h-5 w-5" />
               </button>
            </div>
            <div className="absolute bottom-1 right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
              <Shield className="h-3 w-3 text-white" />
            </div>
         </div>
         <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-slate-800">{profile.name}</h3>
            <p className="text-sm text-slate-500 font-mono tracking-tighter">NHIS: {profile.nid}</p>
         </div>
         <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 uppercase tracking-widest text-[9px] font-bold">Standard Patient</Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 uppercase tracking-widest text-[9px] font-bold">Verified</Badge>
         </div>
      </div>

      {/* Contact Summary List */}
      <Card className="border-slate-100 shadow-sm divide-y">
         <div className="p-4 flex items-start gap-4">
            <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
            <div className="space-y-0.5">
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{t('patientPortal.profile.email')}</p>
               <p className="text-sm font-medium text-slate-700">{profile.email}</p>
            </div>
         </div>
         <div className="p-4 flex items-start gap-4">
            <Smartphone className="h-5 w-5 text-slate-400 mt-0.5" />
            <div className="space-y-0.5">
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-none text-nowrap">{t('patientPortal.profile.phone')}</p>
               <p className="text-sm font-medium text-slate-700">{profile.phone}</p>
            </div>
         </div>
         <div className="p-4 flex items-start gap-4">
            <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
            <div className="space-y-0.5 shrink">
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{t('patientPortal.profile.address')}</p>
               <p className="text-sm font-medium text-slate-700 leading-tight">{profile.address}</p>
            </div>
         </div>
      </Card>

      {/* Digital Health Card Quick Access */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                 <QrCode className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-sm font-bold text-slate-800">Digital Health Card</p>
                 <p className="text-[10px] text-slate-500">Present this QR code for identification</p>
              </div>
           </div>
           <Button 
             size="icon" 
             variant="ghost" 
             className="text-primary hover:bg-white"
             onClick={() => toast({ title: "Sharing Digital ID", description: "Secured Health ID link ready to share via NHIS Network." })}
           >
              <Share2 className="h-4 w-4" />
           </Button>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="space-y-4">
         <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">App Settings</h3>
         <Card className="border-slate-100 shadow-sm divide-y">
            <div className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Health Notifications</span>
               </div>
               <Switch defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Device Biometrics</span>
               </div>
               <Switch defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Hide PII on Summary</span>
               </div>
               <Switch />
            </div>
         </Card>

         <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Privacy & Support</h3>
         <Card className="border-slate-100 shadow-sm divide-y">
            <button 
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              onClick={() => router.push('/technical-documentation')}
            >
               <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Privacy Policy</span>
               </div>
               <ExternalLink className="h-4 w-4 text-slate-300" />
            </button>
            <button 
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors" 
              onClick={() => router.push('/technical-documentation')}
            >
               <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">System Information</span>
               </div>
               <ExternalLink className="h-4 w-4 text-slate-300" />
            </button>
          </Card>

         <Button 
           variant="outline" 
           className="w-full h-12 text-red-600 border-red-100 hover:bg-red-50 font-bold"
           onClick={handleLogout}
         >
           <LogOut className="h-5 w-5 mr-2" />
           Log Out from Portal
         </Button>
      </div>

      <p className="text-center text-[10px] text-slate-400 font-medium pb-8 uppercase tracking-widest">
        H365 Clinical Node ID: CL-772-MZ
      </p>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
