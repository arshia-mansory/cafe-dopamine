import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding database...');

  // Seed SiteSettings
  await db.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
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
    },
  });
  console.log('✅ SiteSettings seeded');

  // Seed ThemeSettings
  await db.themeSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
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
    },
  });
  console.log('✅ ThemeSettings seeded');

  // Seed categories and items
  const categories = [
    {
      name: 'قهوه‌های گرم',
      icon: '☕',
      sortOrder: 1,
      items: [
        { name: 'اسپرسو', description: 'یک شات اسپرسو خالص و غلیظ', sortOrder: 1 },
        { name: 'دابل اسپرسو', description: 'دو شات اسپرسو برای عاشقان قهوه قوی', sortOrder: 2 },
        { name: 'کاپوچینو', description: 'اسپرسو با شیر فراوان و فوم ابریشمی', sortOrder: 3 },
        { name: 'لاته', description: 'اسپرسو با شیر بخار داده شده', sortOrder: 4 },
        { name: 'موکا', description: 'لاته با شکلات داغ و خامه فراوان', sortOrder: 5 },
        { name: 'ماکیاتو', description: 'اسپرسو با لکه‌ای از فوم شیر', sortOrder: 6 },
        { name: 'آمریکانو', description: 'اسپرسو رقیق شده با آب داغ', sortOrder: 7 },
        { name: 'قهوه ترک', description: 'قهوه سنتی ترکی با طعم غنی و عطر دلنشین', sortOrder: 8 },
        { name: 'فلت وایت', description: 'اسپرسو با شیر میکروفوم ابریشمی', sortOrder: 9 },
        { name: 'کورتادو', description: 'اسپرسو با مقدار کمی شیر بخار داده', sortOrder: 10 },
      ],
    },
    {
      name: 'قهوه‌های سرد',
      icon: '🧊',
      sortOrder: 2,
      items: [
        { name: 'آیس لاته', description: 'لاته سرد با یخ و شیر تازه', sortOrder: 1 },
        { name: 'آیس موکا', description: 'موکای سرد با شکلات و خامه', sortOrder: 2 },
        { name: 'کلد برو', description: 'قهوه دم‌کرده سرد به مدت ۱۲ ساعت', sortOrder: 3 },
        { name: 'فراپه', description: 'قهوه مخلوط با یخ و شیرینی', sortOrder: 4 },
        { name: 'آیس آمریکانو', description: 'آمریکانوی سرد با یخ', sortOrder: 5 },
        { name: 'نیترو کلد برو', description: 'کلد برو با نیتروژن و بافت کرم‌مانند', sortOrder: 6 },
        { name: 'آفوگاتو', description: 'بستنی وانیلی با اسپرسو تازه', sortOrder: 7 },
        { name: 'آیس ماکیاتو', description: 'اسپرسو روی یخ با شیر سرد', sortOrder: 8 },
      ],
    },
    {
      name: 'دمنوش و چای',
      icon: '🍵',
      sortOrder: 3,
      items: [
        { name: 'دمنوش بابونه', description: 'دمنوش آرامش‌بخش بابونه طبیعی', sortOrder: 1 },
        { name: 'چای نعناع', description: 'چای نعناع تازه و خنک‌کننده', sortOrder: 2 },
        { name: 'چای زعفرانی', description: 'چای زعفرانی اصل با عطر بی‌نظیر', sortOrder: 3 },
        { name: 'ماسالا چای', description: 'چای ادویه‌ای هندی با طعم‌های گرم', sortOrder: 4 },
        { name: 'چای سبز', description: 'چای سبز طبیعی سرشار از آنتی‌اکسیدان', sortOrder: 5 },
        { name: 'ارل گری', description: 'چای سیاه معطر با برگاموت', sortOrder: 6 },
        { name: 'دمنوش چای ترش', description: 'دمنوش هیبیسکوس با طعم ترش و ملایم', sortOrder: 7 },
        { name: 'چای یاسمن', description: 'چای سبز معطر با گل یاسمن', sortOrder: 8 },
      ],
    },
    {
      name: 'نوشیدنی‌های سرد',
      icon: '🍹',
      sortOrder: 4,
      items: [
        { name: 'لیموناد', description: 'لیموناد تازه با نعناع و یخ', sortOrder: 1 },
        { name: 'موهیتو', description: 'موهیتو با لیمو تازه، نعناع و یخ', sortOrder: 2 },
        { name: 'میلک‌شیک شکلاتی', description: 'میلک‌شیک غلیظ با شکلات و خامه', sortOrder: 3 },
        { name: 'میلک‌شیک وانیلی', description: 'میلک‌شیک نرم با طعم وانیل', sortOrder: 4 },
        { name: 'میلک‌شیک توت‌فرنگی', description: 'میلک‌شیک خوشمزه با توت‌فرنگی تازه', sortOrder: 5 },
        { name: 'اسموتی توت‌ها', description: 'اسموتی مخلوط توت‌های تازه', sortOrder: 6 },
        { name: 'شکلات سرد', description: 'شکلات داغ سرد با خامه فراوان', sortOrder: 7 },
      ],
    },
    {
      name: 'دسر و کیک',
      icon: '🍰',
      sortOrder: 5,
      items: [
        { name: 'چیزکیک', description: 'چیزکیک نیویورکی با پایه بیسکویت', sortOrder: 1 },
        { name: 'تیرامیسو', description: 'دسر ایتالیایی با قهوه و ماسکارپونه', sortOrder: 2 },
        { name: 'فوندان شکلاتی', description: 'کیک شکلاتی با مغز مذاب شکلات', sortOrder: 3 },
        { name: 'براونی', description: 'براونی شکلاتی غلیظ و خوشمزه', sortOrder: 4 },
        { name: 'کیک هویج', description: 'کیک هویج با کرم پنیر', sortOrder: 5 },
        { name: 'کرم بروله', description: 'کرم بروله فرانسوی با کارامل ترد', sortOrder: 6 },
        { name: 'پانا کوتا', description: 'دسر ایتالیایی با وانیل و سس میوه', sortOrder: 7 },
        { name: 'ماکارون', description: 'ماکارون فرانسوی با طعم‌های متنوع', sortOrder: 8 },
      ],
    },
    {
      name: 'صبحانه و میان‌وعده',
      icon: '🥐',
      sortOrder: 6,
      items: [
        { name: 'املت', description: 'املت تازه با سبزیجات و پنیر', sortOrder: 1 },
        { name: 'پنکیک', description: 'پنکیک نرم با شیره افرا و توت‌ها', sortOrder: 2 },
        { name: 'فرنچ تست', description: 'نان تست فرانسوی با دارچین و شکر', sortOrder: 3 },
        { name: 'کروسان', description: 'کروسان تازه و ورقه‌ای', sortOrder: 4 },
        { name: 'آواکادو تست', description: 'نان تست با آواکادو و ادویه', sortOrder: 5 },
        { name: 'پیت صبحانه', description: 'یک پیت کامل صبحانه با تخم‌مرغ و سوسیس', sortOrder: 6 },
      ],
    },
  ];

  for (const cat of categories) {
    const category = await db.menuCategory.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        items: {
          create: cat.items.map((item) => ({
            name: item.name,
            description: item.description,
            price: 0,
            sortOrder: item.sortOrder,
            available: true,
            featured: false,
          })),
        },
      },
    });
    console.log(`✅ Category "${cat.name}" with ${cat.items.length} items seeded`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });