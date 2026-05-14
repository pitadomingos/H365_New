"use client";

import * as React from "react";
import { useLocale } from "@/context/locale-context";
import { getTranslator } from "@/lib/i18n";
import { motion } from "motion/react";
import { Search, Plus, UserCog, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type StaffRole = 'doctor' | 'nurse' | 'admin';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

const MOCK_STAFF: StaffMember[] = [
  { id: "1", firstName: "Alice", lastName: "Wonderland", role: "doctor", department: "Cardiology", email: "alice.w@hospital.com", phone: "(555) 123-4567", status: "active" },
  { id: "2", firstName: "Bob", lastName: "Builder", role: "nurse", department: "Pediatrics", email: "bob.b@hospital.com", phone: "(555) 987-6543", status: "active" },
  { id: "3", firstName: "Charlie", lastName: "Chaplin", role: "admin", department: "Operations", email: "charlie.c@hospital.com", phone: "(555) 555-5555", status: "inactive" },
];

export default function StaffManagementPage() {
  const { currentLocale } = useLocale();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);
  const { toast } = useToast();

  const [staffList, setStaffList] = React.useState<StaffMember[]>(MOCK_STAFF);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null);

  // Form State
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [role, setRole] = React.useState<StaffRole | "">("");
  const [department, setDepartment] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const filteredStaff = staffList.filter(s => {
    const full = `${s.firstName} ${s.lastName}`.toLowerCase();
    const r = s.role.toLowerCase();
    const d = s.department.toLowerCase();
    const q = searchQuery.toLowerCase();
    return full.includes(q) || r.includes(q) || d.includes(q);
  });

  const handleOpenModal = (staff?: StaffMember) => {
    if (staff) {
      setEditingStaff(staff);
      setFirstName(staff.firstName);
      setLastName(staff.lastName);
      setRole(staff.role);
      setDepartment(staff.department);
      setEmail(staff.email);
      setPhone(staff.phone);
    } else {
      setEditingStaff(null);
      setFirstName("");
      setLastName("");
      setRole("");
      setDepartment("");
      setEmail("");
      setPhone("");
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!firstName || !lastName || !role || !department) {
      return; 
    }

    if (editingStaff) {
      setStaffList(prev => prev.map(s => 
        s.id === editingStaff.id 
        ? { ...s, firstName, lastName, role: role as StaffRole, department, email, phone } 
        : s
      ));
    } else {
      const newStaff: StaffMember = {
        id: Math.random().toString(36).substr(2, 9),
        firstName,
        lastName,
        role: role as StaffRole,
        department,
        email,
        phone,
        status: 'active'
      };
      setStaffList(prev => [...prev, newStaff]);
    }

    setIsModalOpen(false);
    toast({
      title: t('staffManagement.toast.saved'),
      description: t('staffManagement.toast.saved.desc'),
    });
  };

  const toggleStatus = (id: string) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" />
            {t('staffManagement.pageTitle')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('staffManagement.addStaff')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card text-card-foreground rounded-xl border shadow-sm"
      >
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('staffManagement.searchPlaceholder')}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('staffManagement.table.name')}</TableHead>
                <TableHead>{t('staffManagement.table.role')}</TableHead>
                <TableHead>{t('staffManagement.table.department')}</TableHead>
                <TableHead>{t('staffManagement.table.contact')}</TableHead>
                <TableHead>{t('staffManagement.table.status')}</TableHead>
                <TableHead className="w-[80px] text-right">{t('staffManagement.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No staff members found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      {staff.firstName} {staff.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {t(`staffManagement.modal.role.${staff.role}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{staff.email}</div>
                        <div className="text-muted-foreground">{staff.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenModal(staff)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(staff.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Toggle Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('staffManagement.modal.title')}</DialogTitle>
            <DialogDescription>
              {t('staffManagement.modal.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('staffManagement.modal.firstName')}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('staffManagement.modal.lastName')}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('staffManagement.modal.role')}</Label>
                <Select value={role} onValueChange={(val) => setRole(val as StaffRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('staffManagement.modal.role.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">{t('staffManagement.modal.role.doctor')}</SelectItem>
                    <SelectItem value="nurse">{t('staffManagement.modal.role.nurse')}</SelectItem>
                    <SelectItem value="admin">{t('staffManagement.modal.role.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">{t('staffManagement.modal.department')}</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('staffManagement.modal.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('staffManagement.modal.phone')}</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('staffManagement.modal.cancel')}
            </Button>
            <Button onClick={handleSave}>
              {t('staffManagement.modal.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
