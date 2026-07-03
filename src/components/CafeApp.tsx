'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Lock,
  Menu as MenuIcon,
  X,
  Plus,
  Pencil,
  Trash2,
  Upload,
  MapPin,
  Phone,
  Clock,
  Instagram,
  Send,
  MessageCircle,
  ChevronDown,
  Star,
  GripVertical,
  LogOut,
  Palette,
  Settings,
  Image as ImageIcon,
  BookOpen,
  Save,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sortOrder: number;
  available: boolean;
  featured: boolean;
  image: string;
  category?: MenuCategoryType;
}

interface MenuCategoryType {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  image: string;
  items: MenuItemType[];
}

interface SiteSettingsType {
  id: string;
  cafeName: string;
  address: string;
  phone: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  workHours: string;
  mapUrl: string;
  aboutText: string;
}

interface ThemeSettingsType {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutImage: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  cardBgColor: string;
  textColor: string;
  sectionTitle1: string;
  sectionTitle2: string;
  sectionTitle3: string;
  sectionTitle4: string;
  footerText: string;
}

interface CafeAppProps {
  categories: MenuCategoryType[];
  settings: SiteSettingsType | null;
  theme: ThemeSettingsType | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toPersianNumber(num: number): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return num.toLocaleString('en-US').replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

function formatPrice(price: number): string {
  if (price === 0) return 'قیمت وارد نشده';
  return `${toPersianNumber(price)} تومان`;
}

const defaultTheme: ThemeSettingsType = {
  id: 'main',
  heroTitle: 'کافه دوپامین',
  heroSubtitle: 'بهترین قهوه و نوشیدنی‌ها در فضایی دلنشین',
  heroImage: '/uploads/hero/hero-default.png',
  aboutImage: '/uploads/about/about-default.png',
  primaryColor: '#8B5E3C',
  accentColor: '#D4A574',
  bgColor: '#FDF8F3',
  cardBgColor: '#FFFFFF',
  textColor: '#2C1810',
  sectionTitle1: 'درباره ما',
  sectionTitle2: 'منوی کافه',
  sectionTitle3: 'محبوب‌ترین‌ها',
  sectionTitle4: 'موقعیت ما',
  footerText: 'تمامی حقوق محفوظ است',
};

const defaultSettings: SiteSettingsType = {
  id: 'main',
  cafeName: 'کافه دوپامین',
  address: 'اسلامشهر، باغ فیض',
  phone: '',
  instagram: '',
  telegram: '',
  whatsapp: '',
  workHours: 'همه روزه ۸ صبح تا ۱۲ شب',
  mapUrl: '',
  aboutText: 'کافه دوپامین، فضایی دلنشین برای لذت بردن از بهترین قهوه و نوشیدنی‌ها',
};

async function apiFetch(action: string, options?: RequestInit) {
  const res = await fetch(`/api?action=${action}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': 'dopamine1403',
      ...options?.headers,
    },
    ...options,
  });
  return res.json();
}

async function uploadImage(file: File, type: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const res = await fetch('/api?action=upload', {
    method: 'POST',
    headers: { 'x-admin-password': 'dopamine1403' },
    body: formData,
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.path;
}

// ─── Sortable Item ───────────────────────────────────────────────────────────

function SortableItem({ item, onEdit, onDelete, onToggleAvailable, onToggleFeatured, themeColors }: {
  item: MenuItemType;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailable: () => void;
  onToggleFeatured: () => void;
  themeColors: ThemeSettingsType;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{item.name}</span>
          {!item.available && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">ناموجود</Badge>
          )}
          {item.featured && (
            <Badge style={{ backgroundColor: themeColors.accentColor, color: '#fff' }} className="text-[10px] px-1.5 py-0">محبوب</Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {formatPrice(item.price)}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Switch
          checked={item.featured}
          onCheckedChange={onToggleFeatured}
          title="محبوب"
          className="scale-75"
        />
        <Switch
          checked={item.available}
          onCheckedChange={onToggleAvailable}
          title="موجود"
          className="scale-75"
        />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CafeApp({ categories: initialCategories, settings: initialSettings, theme: initialTheme }: CafeAppProps) {
  // ── State ──
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<string>('menu');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');

  // Data
  const [menuData, setMenuData] = useState<MenuCategoryType[]>(initialCategories);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsType>(initialSettings || defaultSettings);
  const [themeSettings, setThemeSettings] = useState<ThemeSettingsType>(initialTheme || defaultTheme);
  const [featuredItems, setFeaturedItems] = useState<MenuItemType[]>([]);

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenuCategory, setActiveMenuCategory] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategoryType | null>(null);
  const [catForm, setCatForm] = useState({ name: '', icon: '☕', image: '' });

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    image: '',
    available: true,
    featured: false,
  });

  // Refs
  const menuRef = useRef<HTMLElement>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Load featured items
  useEffect(() => {
    fetch('/api?action=featured')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setFeaturedItems(data);
      })
      .catch(() => {});
  }, []);

  // ── Auth ──
  const handleLogin = useCallback(async () => {
    try {
      const res = await fetch('/api?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        setLoginOpen(false);
        setLoginPassword('');
        toast.success('ورود موفق!');
        // Expand first category
        if (menuData.length > 0) {
          setExpandedCategories(new Set([menuData[0].id]));
        }
      } else {
        toast.error('رمز اشتباه است');
      }
    } catch {
      toast.error('خطا در ورود');
    }
  }, [loginPassword, menuData]);

  const handleLogout = useCallback(() => {
    setIsAdmin(false);
    setShowAdmin(false);
    toast.info('خروج موفق');
  }, []);

  // ── Refresh data ──
  const refreshMenu = useCallback(async () => {
    try {
      const data = await apiFetch('menu');
      if (Array.isArray(data)) setMenuData(data);
    } catch { /* ignore */ }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await apiFetch('settings');
      if (data.settings) setSiteSettings(data.settings);
      if (data.theme) setThemeSettings(data.theme);
    } catch { /* ignore */ }
  }, []);

  // ── Category CRUD ──
  const openAddCategory = useCallback(() => {
    setEditingCategory(null);
    setCatForm({ name: '', icon: '☕', image: '' });
    setCategoryDialogOpen(true);
  }, []);

  const openEditCategory = useCallback((cat: MenuCategoryType) => {
    setEditingCategory(cat);
    setCatForm({ name: cat.name, icon: cat.icon, image: cat.image });
    setCategoryDialogOpen(true);
  }, []);

  const saveCategory = useCallback(async () => {
    if (!catForm.name.trim()) {
      toast.error('نام دسته‌بندی الزامی است');
      return;
    }
    try {
      if (editingCategory) {
        await apiFetch('category', {
          method: 'PUT',
          body: JSON.stringify({ id: editingCategory.id, ...catForm }),
        });
        toast.success('دسته‌بندی ویرایش شد');
      } else {
        await apiFetch('category', {
          method: 'POST',
          body: JSON.stringify({ ...catForm, sortOrder: menuData.length + 1 }),
        });
        toast.success('دسته‌بندی اضافه شد');
      }
      setCategoryDialogOpen(false);
      await refreshMenu();
    } catch {
      toast.error('خطا در ذخیره دسته‌بندی');
    }
  }, [catForm, editingCategory, menuData.length, refreshMenu]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await fetch(`/api?action=category&id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': 'dopamine1403' },
      });
      toast.success('دسته‌بندی حذف شد');
      await refreshMenu();
    } catch {
      toast.error('خطا در حذف');
    }
  }, [refreshMenu]);

  // ── Item CRUD ──
  const openAddItem = useCallback((categoryId: string) => {
    setEditingItem(null);
    setItemForm({
      name: '',
      description: '',
      price: 0,
      categoryId,
      image: '',
      available: true,
      featured: false,
    });
    setItemDialogOpen(true);
  }, []);

  const openEditItem = useCallback((item: MenuItemType) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      image: item.image,
      available: item.available,
      featured: item.featured,
    });
    setItemDialogOpen(true);
  }, []);

  const saveItem = useCallback(async () => {
    if (!itemForm.name.trim()) {
      toast.error('نام آیتم الزامی است');
      return;
    }
    try {
      if (editingItem) {
        await apiFetch('item', {
          method: 'PUT',
          body: JSON.stringify({ id: editingItem.id, ...itemForm }),
        });
        toast.success('آیتم ویرایش شد');
      } else {
        const cat = menuData.find((c) => c.id === itemForm.categoryId);
        const itemCount = cat?.items.length ?? 0;
        await apiFetch('item', {
          method: 'POST',
          body: JSON.stringify({ ...itemForm, sortOrder: itemCount + 1 }),
        });
        toast.success('آیتم اضافه شد');
      }
      setItemDialogOpen(false);
      await refreshMenu();
    } catch {
      toast.error('خطا در ذخیره آیتم');
    }
  }, [itemForm, editingItem, menuData, refreshMenu]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await fetch(`/api?action=item&id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': 'dopamine1403' },
      });
      toast.success('آیتم حذف شد');
      await refreshMenu();
    } catch {
      toast.error('خطا در حذف');
    }
  }, [refreshMenu]);

  const toggleItemAvailable = useCallback(async (item: MenuItemType) => {
    try {
      await apiFetch('item', {
        method: 'PUT',
        body: JSON.stringify({ id: item.id, available: !item.available }),
      });
      await refreshMenu();
    } catch {
      toast.error('خطا');
    }
  }, [refreshMenu]);

  const toggleItemFeatured = useCallback(async (item: MenuItemType) => {
    try {
      await apiFetch('item', {
        method: 'PUT',
        body: JSON.stringify({ id: item.id, featured: !item.featured }),
      });
      await refreshMenu();
    } catch {
      toast.error('خطا');
    }
  }, [refreshMenu]);

  // ── Reorder ──
  const handleDragEnd = useCallback(async (event: DragEndEvent, categoryId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const cat = menuData.find((c) => c.id === categoryId);
    if (!cat) return;

    const oldIndex = cat.items.findIndex((i) => i.id === active.id);
    const newIndex = cat.items.findIndex((i) => i.id === over.id);
    const newItems = arrayMove(cat.items, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    setMenuData((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, items: newItems } : c))
    );

    try {
      await apiFetch('reorder', {
        method: 'PUT',
        body: JSON.stringify({
          items: newItems.map((i) => ({ id: i.id, sortOrder: i.sortOrder })),
        }),
      });
    } catch {
      toast.error('خطا در مرتب‌سازی');
      await refreshMenu();
    }
  }, [menuData, refreshMenu]);

  // ── Theme/Settings save ──
  const saveTheme = useCallback(async () => {
    try {
      await apiFetch('theme', {
        method: 'PUT',
        body: JSON.stringify(themeSettings),
      });
      toast.success('تنظیمات ظاهری ذخیره شد');
    } catch {
      toast.error('خطا');
    }
  }, [themeSettings]);

  const saveSiteSettings = useCallback(async () => {
    try {
      await apiFetch('settings', {
        method: 'PUT',
        body: JSON.stringify(siteSettings),
      });
      toast.success('اطلاعات سایت ذخیره شد');
    } catch {
      toast.error('خطا');
    }
  }, [siteSettings]);

  // ── Image upload handlers ──
  const handleHeroUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = await uploadImage(file, 'hero');
      const newTheme = { ...themeSettings, heroImage: path };
      setThemeSettings(newTheme);
      await apiFetch('theme', { method: 'PUT', body: JSON.stringify({ heroImage: path }) });
      toast.success('عکس هدر آپلود شد');
    } catch {
      toast.error('خطا در آپلود');
    }
  }, [themeSettings]);

  const handleAboutUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = await uploadImage(file, 'about');
      const newTheme = { ...themeSettings, aboutImage: path };
      setThemeSettings(newTheme);
      await apiFetch('theme', { method: 'PUT', body: JSON.stringify({ aboutImage: path }) });
      toast.success('عکس درباره ما آپلود شد');
    } catch {
      toast.error('خطا در آپلود');
    }
  }, [themeSettings]);

  const handleItemImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = await uploadImage(file, 'item');
      await apiFetch('item', { method: 'PUT', body: JSON.stringify({ id: itemId, image: path }) });
      toast.success('عکس آپلود شد');
      await refreshMenu();
    } catch {
      toast.error('خطا در آپلود');
    }
  }, [refreshMenu]);

  // ── Scroll to section ──
  const scrollToMenu = useCallback(() => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Map URL ──
  const mapSrc = siteSettings.mapUrl || `https://www.google.com/maps?q=${encodeURIComponent(siteSettings.address || 'اسلامشهر، باغ فیض')}&output=embed`;

  // ── Filtered menu items ──
  const filteredCategories = activeMenuCategory === 'all'
    ? menuData
    : menuData.filter((c) => c.id === activeMenuCategory);

  const allMenuItems = filteredCategories.flatMap((c) => c.items);

  // ── Theme color shortcuts ──
  const tc = themeSettings;

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: tc.bgColor, color: tc.textColor }}
    >
      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b"
        style={{
          backgroundColor: `${tc.cardBgColor}ee`,
          borderColor: `${tc.accentColor}33`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Cafe Name */}
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold" style={{ color: tc.primaryColor }}>
                {siteSettings.cafeName}
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {[
                { label: tc.sectionTitle1, target: 'about' },
                { label: tc.sectionTitle2, target: 'menu' },
                { label: tc.sectionTitle3, target: 'featured' },
                { label: tc.sectionTitle4, target: 'location' },
              ].map((link) => (
                <button
                  key={link.target}
                  onClick={() => scrollTo(link.target)}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: tc.textColor }}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Admin + Mobile Menu */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:flex"
                >
                  <LogOut className="h-4 w-4 ml-1" />
                  خروج
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isAdmin) {
                    setShowAdmin(!showAdmin);
                  } else {
                    setLoginOpen(true);
                  }
                }}
                style={{ color: tc.primaryColor }}
                title={isAdmin ? 'پنل مدیریت' : 'ورود مدیریت'}
              >
                <Lock className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ color: tc.textColor }}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 flex flex-col gap-2">
              {[
                { label: tc.sectionTitle1, target: 'about' },
                { label: tc.sectionTitle2, target: 'menu' },
                { label: tc.sectionTitle3, target: 'featured' },
                { label: tc.sectionTitle4, target: 'location' },
              ].map((link) => (
                <button
                  key={link.target}
                  onClick={() => scrollTo(link.target)}
                  className="text-sm font-medium py-2 px-3 rounded-lg text-right transition-colors hover:bg-black/5"
                  style={{ color: tc.textColor }}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* ─── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${tc.heroImage})` }}
          />
          <div className="absolute inset-0" style={{ backgroundColor: `${tc.textColor}88` }} />
          <div className="relative z-10 text-center px-4 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg" style={{ color: '#FFFFFF' }}>
              {tc.heroTitle}
            </h1>
            <p className="text-lg sm:text-xl mb-8 drop-shadow-md" style={{ color: `${tc.accentColor}ee` }}>
              {tc.heroSubtitle}
            </p>
            <Button
              size="lg"
              onClick={scrollToMenu}
              className="text-base px-8 py-6 rounded-xl font-semibold shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: tc.accentColor, color: '#fff' }}
            >
              مشاهده منو
            </Button>
          </div>
        </section>

        {/* ─── ABOUT ─────────────────────────────────────────────────────── */}
        <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" style={{ color: tc.primaryColor }}>
            {tc.sectionTitle1}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={tc.aboutImage}
                alt="درباره کافه دوپامین"
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
            <div>
              <p className="text-base sm:text-lg leading-8" style={{ color: `${tc.textColor}dd` }}>
                {siteSettings.aboutText}
              </p>
            </div>
          </div>
        </section>

        {/* ─── FEATURED ──────────────────────────────────────────────────── */}
        {featuredItems.length > 0 && (
          <section id="featured" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" style={{ color: tc.primaryColor }}>
              {tc.sectionTitle3}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg"
                  style={{ backgroundColor: tc.cardBgColor }}
                >
                  {item.image && (
                    <div className="w-full h-48 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg" style={{ color: tc.primaryColor }}>{item.name}</h3>
                      <Star className="h-5 w-5 shrink-0" style={{ color: tc.accentColor, fill: tc.accentColor }} />
                    </div>
                    {item.description && (
                      <p className="text-sm mb-3" style={{ color: `${tc.textColor}99` }}>{item.description}</p>
                    )}
                    <p className="font-semibold text-sm" style={{ color: tc.primaryColor }}>
                      {formatPrice(item.price)}
                    </p>
                    {item.category && (
                      <Badge variant="secondary" className="mt-2 text-xs" style={{ backgroundColor: `${tc.accentColor}22`, color: tc.primaryColor }}>
                        {item.category.icon} {item.category.name}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ─── MENU ──────────────────────────────────────────────────────── */}
        <section
          ref={menuRef}
          id="menu"
          className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" style={{ color: tc.primaryColor }}>
            {tc.sectionTitle2}
          </h2>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveMenuCategory('all')}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: activeMenuCategory === 'all' ? tc.primaryColor : `${tc.primaryColor}15`,
                color: activeMenuCategory === 'all' ? '#fff' : tc.primaryColor,
              }}
            >
              همه
            </button>
            {menuData.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveMenuCategory(cat.id)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeMenuCategory === cat.id ? tc.primaryColor : `${tc.primaryColor}15`,
                  color: activeMenuCategory === cat.id ? '#fff' : tc.primaryColor,
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allMenuItems.filter((i) => i.available).map((item) => (
              <Card
                key={item.id}
                className="rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg"
                style={{ backgroundColor: tc.cardBgColor }}
              >
                {item.image ? (
                  <div className="w-full h-48 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-full h-48 flex items-center justify-center text-5xl"
                    style={{ backgroundColor: `${tc.accentColor}15` }}
                  >
                    🍽️
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1" style={{ color: tc.primaryColor }}>{item.name}</h3>
                  {item.description && (
                    <p className="text-sm mb-3" style={{ color: `${tc.textColor}99` }}>{item.description}</p>
                  )}
                  <p className="font-semibold" style={{ color: item.price > 0 ? tc.primaryColor : `${tc.textColor}66` }}>
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Show unavailable items count */}
          {allMenuItems.filter((i) => !i.available).length > 0 && (
            <p className="text-center mt-6 text-sm" style={{ color: `${tc.textColor}66` }}>
              {toPersianNumber(allMenuItems.filter((i) => !i.available).length)} آیتم ناموجود
            </p>
          )}
        </section>

        {/* ─── LOCATION ──────────────────────────────────────────────────── */}
        <section id="location" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" style={{ color: tc.primaryColor }}>
            {tc.sectionTitle4}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 shrink-0" style={{ color: tc.accentColor }} />
                <p className="text-base" style={{ color: `${tc.textColor}cc` }}>{siteSettings.address}</p>
              </div>
              {siteSettings.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-1 shrink-0" style={{ color: tc.accentColor }} />
                  <p className="text-base" style={{ color: `${tc.textColor}cc`, direction: 'ltr', textAlign: 'right' }}>
                    {siteSettings.phone}
                  </p>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-1 shrink-0" style={{ color: tc.accentColor }} />
                <p className="text-base" style={{ color: `${tc.textColor}cc` }}>{siteSettings.workHours}</p>
              </div>
              <div className="flex items-center gap-4 mt-6">
                {siteSettings.instagram && (
                  <a href={siteSettings.instagram} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                    <Instagram className="h-6 w-6" style={{ color: tc.primaryColor }} />
                  </a>
                )}
                {siteSettings.telegram && (
                  <a href={siteSettings.telegram} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                    <Send className="h-6 w-6" style={{ color: tc.primaryColor }} />
                  </a>
                )}
                {siteSettings.whatsapp && (
                  <a href={siteSettings.whatsapp} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                    <MessageCircle className="h-6 w-6" style={{ color: tc.primaryColor }} />
                  </a>
                )}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg h-72 sm:h-80">
              <iframe
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقعیت کافه"
              />
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────────────── */}
      <footer
        className="mt-auto border-t py-8 px-4 sm:px-6 lg:px-8"
        style={{ borderColor: `${tc.accentColor}33`, backgroundColor: `${tc.primaryColor}08` }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-lg" style={{ color: tc.primaryColor }}>
            {siteSettings.cafeName}
          </span>
          <div className="flex items-center gap-4">
            {siteSettings.instagram && (
              <a href={siteSettings.instagram} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                <Instagram className="h-5 w-5" style={{ color: tc.primaryColor }} />
              </a>
            )}
            {siteSettings.telegram && (
              <a href={siteSettings.telegram} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                <Send className="h-5 w-5" style={{ color: tc.primaryColor }} />
              </a>
            )}
            {siteSettings.whatsapp && (
              <a href={siteSettings.whatsapp} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                <MessageCircle className="h-5 w-5" style={{ color: tc.primaryColor }} />
              </a>
            )}
          </div>
          <p className="text-sm" style={{ color: `${tc.textColor}88` }}>
            {tc.footerText} © {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* ─── LOGIN DIALOG ────────────────────────────────────────────────── */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>ورود به پنل مدیریت</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="رمز عبور را وارد کنید"
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleLogin} style={{ backgroundColor: tc.primaryColor, color: '#fff' }}>
              ورود
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ADMIN PANEL (Sheet) ─────────────────────────────────────────── */}
      <Sheet open={showAdmin && isAdmin} onOpenChange={setShowAdmin}>
        <SheetContent
          side="right"
          className="w-[95vw] sm:max-w-lg p-0 overflow-hidden flex flex-col"
        >
          <SheetHeader className="p-4 border-b shrink-0">
            <div className="flex items-center justify-between w-full pr-8">
              <SheetTitle className="text-lg font-bold" style={{ color: tc.primaryColor }}>
                پنل مدیریت
              </SheetTitle>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={handleLogout} className="sm:hidden">
                  <LogOut className="h-4 w-4 ml-1" />
                  خروج
                </Button>
              )}
            </div>
          </SheetHeader>

          <Tabs value={activeAdminTab} onValueChange={setActiveAdminTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full grid grid-cols-4 shrink-0 rounded-none border-b bg-transparent h-auto p-0">
              <TabsTrigger
                value="menu"
                className="flex flex-col items-center gap-1 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs"
                style={{ color: tc.primaryColor }}
              >
                <BookOpen className="h-4 w-4" />
                منو
              </TabsTrigger>
              <TabsTrigger
                value="theme"
                className="flex flex-col items-center gap-1 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs"
                style={{ color: tc.primaryColor }}
              >
                <Palette className="h-4 w-4" />
                تزیین
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex flex-col items-center gap-1 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs"
                style={{ color: tc.primaryColor }}
              >
                <Settings className="h-4 w-4" />
                اطلاعات
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="flex flex-col items-center gap-1 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs"
                style={{ color: tc.primaryColor }}
              >
                <ImageIcon className="h-4 w-4" />
                عکس‌ها
              </TabsTrigger>
            </TabsList>

            {/* ── TAB: MENU ── */}
            <TabsContent value="menu" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Button onClick={openAddCategory} className="w-full" style={{ backgroundColor: tc.primaryColor, color: '#fff' }}>
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن دسته‌بندی
                  </Button>

                  {menuData.map((cat) => (
                    <Card key={cat.id} className="overflow-hidden">
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer select-none"
                        onClick={() => toggleCategory(cat.id)}
                        style={{ backgroundColor: `${tc.primaryColor}08` }}
                      >
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span className="font-semibold text-sm">{cat.name}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {toPersianNumber(cat.items.length)} آیتم
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); openEditCategory(cat); }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${expandedCategories.has(cat.id) ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </div>

                      {expandedCategories.has(cat.id) && (
                        <div className="p-3 space-y-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => openAddItem(cat.id)}
                          >
                            <Plus className="h-3.5 w-3.5 ml-1" />
                            افزودن آیتم
                          </Button>

                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, cat.id)}
                          >
                            <SortableContext
                              items={cat.items.map((i) => i.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {cat.items.map((item) => (
                                <SortableItem
                                  key={item.id}
                                  item={item}
                                  onEdit={() => openEditItem(item)}
                                  onDelete={() => deleteItem(item.id)}
                                  onToggleAvailable={() => toggleItemAvailable(item)}
                                  onToggleFeatured={() => toggleItemFeatured(item)}
                                  themeColors={tc}
                                />
                              ))}
                            </SortableContext>
                          </DndContext>

                          {cat.items.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-4">
                              آیتمی وجود ندارد
                            </p>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ── TAB: THEME ── */}
            <TabsContent value="theme" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  <h3 className="font-semibold text-sm" style={{ color: tc.primaryColor }}>رنگ‌ها</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'primaryColor', label: 'رنگ اصلی' },
                      { key: 'accentColor', label: 'رنگ تاکیدی' },
                      { key: 'bgColor', label: 'پس‌زمینه' },
                      { key: 'cardBgColor', label: 'پس‌زمینه کارت' },
                      { key: 'textColor', label: 'رنگ متن' },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-1.5">
                        <Label className="text-xs">{label}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={themeSettings[key as keyof ThemeSettingsType] as string}
                            onChange={(e) =>
                              setThemeSettings((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className="h-9 w-9 cursor-pointer rounded border"
                          />
                          <Input
                            value={themeSettings[key as keyof ThemeSettingsType] as string}
                            onChange={(e) =>
                              setThemeSettings((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className="text-xs h-9 font-mono"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-semibold text-sm" style={{ color: tc.primaryColor }}>پیش‌نمایش رنگ‌ها</h3>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries({
                      'رنگ اصلی': tc.primaryColor,
                      'رنگ تاکیدی': tc.accentColor,
                      'پس‌زمینه': tc.bgColor,
                      'کارت': tc.cardBgColor,
                      'متن': tc.textColor,
                    }).map(([label, color]) => (
                      <div key={label} className="text-center">
                        <div className="w-14 h-14 rounded-lg border shadow-sm" style={{ backgroundColor: color }} />
                        <span className="text-[10px] mt-1 block">{label}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-semibold text-sm" style={{ color: tc.primaryColor }}>متن‌ها</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'heroTitle', label: 'عنوان هدر' },
                      { key: 'heroSubtitle', label: 'زیرعنوان هدر' },
                      { key: 'sectionTitle1', label: 'عنوان بخش ۱' },
                      { key: 'sectionTitle2', label: 'عنوان بخش ۲' },
                      { key: 'sectionTitle3', label: 'عنوان بخش ۳' },
                      { key: 'sectionTitle4', label: 'عنوان بخش ۴' },
                      { key: 'footerText', label: 'متن فوتر' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <Label className="text-xs">{label}</Label>
                        <Input
                          value={themeSettings[key as keyof ThemeSettingsType] as string}
                          onChange={(e) =>
                            setThemeSettings((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="mt-1 text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={saveTheme} className="w-full" style={{ backgroundColor: tc.primaryColor, color: '#fff' }}>
                    <Save className="h-4 w-4 ml-2" />
                    ذخیره تنظیمات ظاهری
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ── TAB: SETTINGS ── */}
            <TabsContent value="settings" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {[
                    { key: 'cafeName', label: 'نام کافه', type: 'text' },
                    { key: 'address', label: 'آدرس', type: 'text' },
                    { key: 'phone', label: 'تلفن', type: 'text' },
                    { key: 'instagram', label: 'اینستاگرام', type: 'text' },
                    { key: 'telegram', label: 'تلگرام', type: 'text' },
                    { key: 'whatsapp', label: 'واتساپ', type: 'text' },
                    { key: 'workHours', label: 'ساعت کاری', type: 'text' },
                    { key: 'mapUrl', label: 'لینک نقشه', type: 'text' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label className="text-xs">{label}</Label>
                      <Input
                        value={siteSettings[key as keyof SiteSettingsType] as string}
                        onChange={(e) =>
                          setSiteSettings((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="mt-1 text-sm"
                        dir={key === 'mapUrl' || key === 'phone' ? 'ltr' : 'rtl'}
                      />
                    </div>
                  ))}
                  <div>
                    <Label className="text-xs">درباره ما</Label>
                    <Textarea
                      value={siteSettings.aboutText}
                      onChange={(e) =>
                        setSiteSettings((prev) => ({ ...prev, aboutText: e.target.value }))
                      }
                      className="mt-1 text-sm min-h-[100px]"
                    />
                  </div>
                  <Button onClick={saveSiteSettings} className="w-full" style={{ backgroundColor: tc.primaryColor, color: '#fff' }}>
                    <Save className="h-4 w-4 ml-2" />
                    ذخیره اطلاعات
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* ── TAB: IMAGES ── */}
            <TabsContent value="images" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                  {/* Hero Image */}
                  <div>
                    <Label className="text-sm font-semibold">عکس هدر</Label>
                    <div className="mt-2 rounded-xl overflow-hidden border h-40">
                      {tc.heroImage && (
                        <img src={tc.heroImage} alt="هدر" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <input
                      ref={(el) => { fileInputRefs.current['hero'] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleHeroUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => fileInputRefs.current['hero']?.click()}
                    >
                      <Upload className="h-4 w-4 ml-2" />
                      آپلود عکس هدر
                    </Button>
                  </div>

                  {/* About Image */}
                  <div>
                    <Label className="text-sm font-semibold">عکس درباره ما</Label>
                    <div className="mt-2 rounded-xl overflow-hidden border h-40">
                      {tc.aboutImage && (
                        <img src={tc.aboutImage} alt="درباره ما" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <input
                      ref={(el) => { fileInputRefs.current['about'] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAboutUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => fileInputRefs.current['about']?.click()}
                    >
                      <Upload className="h-4 w-4 ml-2" />
                      آپلود عکس درباره ما
                    </Button>
                  </div>

                  {/* Item Images */}
                  <div>
                    <Label className="text-sm font-semibold">عکس آیتم‌های منو</Label>
                    <div className="mt-3 space-y-2">
                      {menuData.flatMap((cat) =>
                        cat.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg border">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded flex items-center justify-center text-xl" style={{ backgroundColor: `${tc.accentColor}15` }}>
                                🍽️
                              </div>
                            )}
                            <span className="text-xs flex-1 truncate">{cat.icon} {item.name}</span>
                            <input
                              ref={(el) => { fileInputRefs.current[item.id] = el; }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleItemImageUpload(e, item.id)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() => fileInputRefs.current[item.id]?.click()}
                            >
                              <Upload className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* ─── CATEGORY DIALOG ─────────────────────────────────────────────── */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>نام دسته‌بندی</Label>
              <Input
                value={catForm.name}
                onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                className="mt-1.5"
                placeholder="مثلاً: قهوه‌های گرم"
              />
            </div>
            <div>
              <Label>آیکون</Label>
              <Input
                value={catForm.icon}
                onChange={(e) => setCatForm((p) => ({ ...p, icon: e.target.value }))}
                className="mt-1.5"
                placeholder="☕"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">از ایموجی‌ها استفاده کنید</p>
            </div>
            <div>
              <Label>تصویر (اختیاری)</Label>
              <Input
                value={catForm.image}
                onChange={(e) => setCatForm((p) => ({ ...p, image: e.target.value }))}
                className="mt-1.5"
                placeholder="/uploads/..."
                dir="ltr"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>انصراف</Button>
            <Button onClick={saveCategory} style={{ backgroundColor: tc.primaryColor, color: '#fff' }}>
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ITEM DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'ویرایش آیتم' : 'افزودن آیتم'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>نام</Label>
              <Input
                value={itemForm.name}
                onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))}
                className="mt-1.5"
                placeholder="نام آیتم"
              />
            </div>
            <div>
              <Label>توضیحات</Label>
              <Textarea
                value={itemForm.description}
                onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))}
                className="mt-1.5"
                placeholder="توضیحات آیتم"
              />
            </div>
            <div>
              <Label>قیمت (تومان)</Label>
              <Input
                type="number"
                value={itemForm.price || ''}
                onChange={(e) => setItemForm((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))}
                className="mt-1.5"
                placeholder="۰"
                dir="ltr"
                min={0}
              />
            </div>
            <div>
              <Label>تصویر (اختیاری)</Label>
              <Input
                value={itemForm.image}
                onChange={(e) => setItemForm((p) => ({ ...p, image: e.target.value }))}
                className="mt-1.5"
                placeholder="/uploads/..."
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={itemForm.available}
                  onCheckedChange={(v) => setItemForm((p) => ({ ...p, available: v }))}
                />
                <Label className="text-sm">موجود</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={itemForm.featured}
                  onCheckedChange={(v) => setItemForm((p) => ({ ...p, featured: v }))}
                />
                <Label className="text-sm">محبوب</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>انصراف</Button>
            <Button onClick={saveItem} style={{ backgroundColor: tc.primaryColor, color: '#fff' }}>
              ذخیره
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}