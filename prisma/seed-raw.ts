import { createClient } from '@libsql/client';
import { HERO_IMAGE, ABOUT_IMAGE } from './seed-images';

const url = "libsql://cafe-dpomine-arshia-mansory.aws-ap-northeast-1.turso.io";
const token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODMxMDQ3MTAsImlkIjoiMDE5ZjI5NTEtYTQwMS03OTFlLWFjODQtODI4ODY0YjY2NTJlIiwia2lkIjoiU0c3X2lxUkFtMlhwVEcyTVdNb0lTSU1LMEhsQXpqZ3cxLTBhWkVKN0ZuVSIsInJpZCI6Ijg5ODFiMWQxLWUzMWEtNDZhZi04ZGU2LWZhYTQyMDZjZTY2ZCJ9.vZKAiP2MgSvRyEI9T8h9a4xHv-TPobXaJVFNWxvaKQibE-WLlJ61ioINz1q6FX_7oS06wz0lH4CiI_-BdT7gAA";

const db = createClient({ url, authToken: token });

async function main() {
  console.log('Creating tables...');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "MenuCategory" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "icon" TEXT NOT NULL DEFAULT '☕',
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "image" TEXT NOT NULL DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "MenuItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL DEFAULT '',
      "price" INTEGER NOT NULL DEFAULT 0,
      "categoryId" TEXT NOT NULL,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "available" BOOLEAN NOT NULL DEFAULT 1,
      "featured" BOOLEAN NOT NULL DEFAULT 0,
      "image" TEXT NOT NULL DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "SiteSettings" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "cafeName" TEXT NOT NULL DEFAULT 'کافه دوپامین',
      "address" TEXT NOT NULL DEFAULT '',
      "phone" TEXT NOT NULL DEFAULT '',
      "instagram" TEXT NOT NULL DEFAULT '',
      "telegram" TEXT NOT NULL DEFAULT '',
      "whatsapp" TEXT NOT NULL DEFAULT '',
      "workHours" TEXT NOT NULL DEFAULT '',
      "mapUrl" TEXT NOT NULL DEFAULT '',
      "aboutText" TEXT NOT NULL DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS "ThemeSettings" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "heroTitle" TEXT NOT NULL DEFAULT '',
      "heroSubtitle" TEXT NOT NULL DEFAULT '',
      "heroImage" TEXT NOT NULL DEFAULT '',
      "aboutImage" TEXT NOT NULL DEFAULT '',
      "primaryColor" TEXT NOT NULL DEFAULT '',
      "accentColor" TEXT NOT NULL DEFAULT '',
      "bgColor" TEXT NOT NULL DEFAULT '',
      "cardBgColor" TEXT NOT NULL DEFAULT '',
      "textColor" TEXT NOT NULL DEFAULT '',
      "sectionTitle1" TEXT NOT NULL DEFAULT '',
      "sectionTitle2" TEXT NOT NULL DEFAULT '',
      "sectionTitle3" TEXT NOT NULL DEFAULT '',
      "sectionTitle4" TEXT NOT NULL DEFAULT '',
      "footerText" TEXT NOT NULL DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);

  console.log('Tables created!');

  console.log('Inserting settings...');

  await db.execute({
    sql: `INSERT INTO "SiteSettings" ("id","cafeName","address","phone","instagram","telegram","whatsapp","workHours","mapUrl","aboutText","createdAt","updatedAt") VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT("id") DO NOTHING`,
    args: ['main', 'کافه دوپامین', 'اسلامشهر، باغ فیض', '', '', '', '', 'همه روزه ۸ صبح تا ۱۲ شب', '', 'کافه دوپامین، فضایی دلنشین برای لذت بردن از بهترین قهوه و نوشیدنی‌ها', new Date().toISOString(), new Date().toISOString()]
  });

  await db.execute({
    sql: `INSERT INTO "ThemeSettings" ("id","heroTitle","heroSubtitle","heroImage","aboutImage","primaryColor","accentColor","bgColor","cardBgColor","textColor","sectionTitle1","sectionTitle2","sectionTitle3","sectionTitle4","footerText","createdAt","updatedAt") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT("id") DO NOTHING`,
    args: ['main', 'کافه دوپامین', 'بهترین قهوه و نوشیدنی‌ها در فضایی دلنشین', HERO_IMAGE, ABOUT_IMAGE, '#8B5E3C', '#D4A574', '#FDF8F3', '#FFFFFF', '#2C1810', 'درباره ما', 'منوی کافه', 'محبوب‌ترین‌ها', 'موقعیت ما', 'تمامی حقوق محفوظ است', new Date().toISOString(), new Date().toISOString()]
  });

  console.log('Settings inserted!');

  const categories = [
    { name: 'قهوه‌های گرم', icon: '☕', sortOrder: 1, items: [
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
    ]},
    { name: 'قهوه‌های سرد', icon: '🧊', sortOrder: 2, items: [
      { name: 'آیس لاته', description: 'لاته سرد با یخ و شیر تازه', sortOrder: 1 },
      { name: 'آیس موکا', description: 'موکای سرد با شکلات و خامه', sortOrder: 2 },
      { name: 'کلد برو', description: 'قهوه دم‌کرده سرد به مدت ۱۲ ساعت', sortOrder: 3 },
      { name: 'فراپه', description: 'قهوه مخلوط با یخ و شیرینی', sortOrder: 4 },
      { name: 'آیس آمریکانو', description: 'آمریکانوی سرد با یخ', sortOrder: 5 },
      { name: 'نیترو کلد برو', description: 'کلد برو با نیتروژن و بافت کرم‌مانند', sortOrder: 6 },
      { name: 'آفوگاتو', description: 'بستنی وانیلی با اسپرسو تازه', sortOrder: 7 },
      { name: 'آیس ماکیاتو', description: 'اسپرسو روی یخ با شیر سرد', sortOrder: 8 },
    ]},
    { name: 'دمنوش و چای', icon: '🍵', sortOrder: 3, items: [
      { name: 'دمنوش بابونه', description: 'دمنوش آرامش‌بخش بابونه طبیعی', sortOrder: 1 },
      { name: 'چای نعناع', description: 'چای نعناع تازه و خنک‌کننده', sortOrder: 2 },
      { name: 'چای زعفرانی', description: 'چای زعفرانی اصل با عطر بی‌نظیر', sortOrder: 3 },
      { name: 'ماسالا چای', description: 'چای ادویه‌ای هندی با طعم‌های گرم', sortOrder: 4 },
      { name: 'چای سبز', description: 'چای سبز طبیعی سرشار از آنتی‌اکسیدان', sortOrder: 5 },
      { name: 'ارل گری', description: 'چای سیاه معطر با برگاموت', sortOrder: 6 },
      { name: 'دمنوش چای ترش', description: 'دمنوش هیبیسکوس با طعم ترش و ملایم', sortOrder: 7 },
      { name: 'چای یاسمن', description: 'چای سبز معطر با گل یاسمن', sortOrder: 8 },
    ]},
    { name: 'نوشیدنی‌های سرد', icon: '🍹', sortOrder: 4, items: [
      { name: 'لیموناد', description: 'لیموناد تازه با نعناع و یخ', sortOrder: 1 },
      { name: 'موهیتو', description: 'موهیتو با لیمو تازه، نعناع و یخ', sortOrder: 2 },
      { name: 'میلک‌شیک شکلاتی', description: 'میلک‌شیک غلیظ با شکلات و خامه', sortOrder: 3 },
      { name: 'میلک‌شیک وانیلی', description: 'میلک‌شیک نرم با طعم وانیل', sortOrder: 4 },
      { name: 'میلک‌شیک توت‌فرنگی', description: 'میلک‌شیک خوشمزه با توت‌فرنگی تازه', sortOrder: 5 },
      { name: 'اسموتی توت‌ها', description: 'اسموتی مخلوط توت‌های تازه', sortOrder: 6 },
      { name: 'شکلات سرد', description: 'شکلات داغ سرد با خامه فراوان', sortOrder: 7 },
    ]},
    { name: 'دسر و کیک', icon: '🍰', sortOrder: 5, items: [
      { name: 'چیزکیک', description: 'چیزکیک نیویورکی با پایه بیسکویت', sortOrder: 1 },
      { name: 'تیرامیسو', description: 'دسر ایتالیایی با قهوه و ماسکارپونه', sortOrder: 2 },
      { name: 'فوندان شکلاتی', description: 'کیک شکلاتی با مغز مذاب شکلات', sortOrder: 3 },
      { name: 'براونی', description: 'براونی شکلاتی غلیظ و خوشمزه', sortOrder: 4 },
      { name: 'کیک هویج', description: 'کیک هویج با کرم پنیر', sortOrder: 5 },
      { name: 'کرم بروله', description: 'کرم بروله فرانسوی با کارامل ترد', sortOrder: 6 },
      { name: 'پانا کوتا', description: 'دسر ایتالیایی با وانیل و سس میوه', sortOrder: 7 },
      { name: 'ماکارون', description: 'ماکارون فرانسوی با طعم‌های متنوع', sortOrder: 8 },
    ]},
    { name: 'صبحانه و میان‌وعده', icon: '🥐', sortOrder: 6, items: [
      { name: 'املت', description: 'املت تازه با سبزیجات و پنیر', sortOrder: 1 },
      { name: 'پنکیک', description: 'پنکیک نرم با شیره افرا و توت‌ها', sortOrder: 2 },
      { name: 'فرنچ تست', description: 'نان تست فرانسوی با دارچین و شکر', sortOrder: 3 },
      { name: 'کروسان', description: 'کروسان تازه و ورقه‌ای', sortOrder: 4 },
      { name: 'آواکادو تست', description: 'نان تست با آواکادو و ادویه', sortOrder: 5 },
      { name: 'پیت صبحانه', description: 'یک پیت کامل صبحانه با تخم‌مرغ و سوسیس', sortOrder: 6 },
    ]},
  ];

  function genId() {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  for (const cat of categories) {
    const catId = genId();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO "MenuCategory" ("id","name","icon","sortOrder","image","createdAt","updatedAt") VALUES (?,?,?,?,?,?,?)`,
      args: [catId, cat.name, cat.icon, cat.sortOrder, '', now, now]
    });

    for (const item of cat.items) {
      const itemId = genId();
      await db.execute({
        sql: `INSERT INTO "MenuItem" ("id","name","description","price","categoryId","sortOrder","available","featured","image","createdAt","updatedAt") VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        args: [itemId, item.name, item.description, 0, catId, item.sortOrder, 1, 0, '', now, now]
      });
    }

    console.log(`✅ "${cat.name}" (${cat.items.length} items)`);
  }

  console.log('\n🎉 Database seeded successfully!');
}

main().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});