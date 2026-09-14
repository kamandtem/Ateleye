/**
 * وارد کردن خودکار «بسته ژست شخصی» (zip ساخته‌شده توسط buildPosePackZip در اپ)
 * به سورس کد برنامه، بدون ادیت کاملاً دستی.
 *
 * این اسکریپت:
 *  ۱. فایل zip را می‌خواند (poses.json + پوشه photos/).
 *  ۲. عکس هر ژست را در public/generated/photos/ کپی می‌کند — با همان پسوند واقعی
 *     (گیف همان گیف می‌ماند، چون هدف کل این کار حفظ انیمیشن گیف است، نه از بین
 *     بردنش با تبدیل اجباری). اگر پکیج «sharp» نصب باشد، عکس‌های ثابت (غیرمتحرک)
 *     برای هماهنگی با بقیه‌ی public/generated/photos به webp تبدیل می‌شوند؛ اگر
 *     sharp نصب نباشد، فقط با همان فرمت اصلی کپی می‌شوند (هیچ‌چیز خراب نمی‌شود).
 *  ۳. رکورد کامل هر ژست را در src/data/importedPoses.ts اضافه می‌کند (فایلی که
 *     جدا از poses.ts نگه‌داری می‌شود چون سیستم عکس خودکار poses.ts همه‌چیز را
 *     به‌صورت pose-NNN.webp بازنویسی می‌کند و برای فایل‌های وارداتی مناسب نیست).
 *  ۴. اگر src/data/poses.ts هنوز IMPORTED_POSES را import/merge نکرده باشد،
 *     این کار را (فقط یک‌بار) خودش انجام می‌دهد.
 *
 * اجرا:
 *   node scripts/import-pose-pack.mjs <مسیر فایل zip>
 *
 * بعد از اجرا، خروجی را حتماً بررسی کن و «npm run typecheck» را اجرا کن.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const zipPath = process.argv[2];
if (!zipPath) {
  console.error('استفاده: node scripts/import-pose-pack.mjs <مسیر فایل zip>');
  process.exit(1);
}
if (!existsSync(zipPath)) {
  console.error(`فایل پیدا نشد: ${zipPath}`);
  process.exit(1);
}

const ROOT = resolve(process.cwd());
const PHOTOS_DIR = resolve(ROOT, 'public/generated/photos');
const IMPORTED_POSES_FILE = resolve(ROOT, 'src/data/importedPoses.ts');
const POSES_FILE = resolve(ROOT, 'src/data/poses.ts');

mkdirSync(PHOTOS_DIR, { recursive: true });

const JSZip = (await import('jszip')).default;

// sharp اختیاری است؛ اگر نصب نباشد، فقط بدون تبدیل فرمت کپی می‌کنیم.
let sharp = null;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn(
    '[import-pose-pack] «sharp» نصب نیست؛ عکس‌های ثابت بدون تبدیل به webp با همان فرمت اصلی کپی می‌شوند.'
  );
  console.warn('[import-pose-pack] برای تبدیل خودکار به webp: npm install sharp');
}

const zipBuffer = readFileSync(zipPath);
const zip = await JSZip.loadAsync(zipBuffer);

const posesJsonFile = zip.file('poses.json');
if (!posesJsonFile) {
  console.error('poses.json داخل zip پیدا نشد. آیا این فایل با buildPosePackZip ساخته شده؟');
  process.exit(1);
}
const pack = JSON.parse(await posesJsonFile.async('string'));
if (pack.app !== 'pose-director' || pack.exportType !== 'pose-pack') {
  console.error('این zip یک «بسته ژست شخصی» معتبر نیست.');
  process.exit(1);
}

/** پسوند واقعی فایل عکس را برمی‌گرداند (برای تشخیص گیف/انیمیشن). */
function extOf(filename) {
  return extname(filename).replace('.', '').toLowerCase();
}

function isAnimatedExt(ext) {
  return ext === 'gif';
}

/** یک شناسه‌ی جاوااسکریپتی امن برای رشته‌ی TS می‌سازد (فرار از بک‌اسلش و کوتیشن). */
function jsString(v) {
  return JSON.stringify(v);
}

// خواندن IMPORTED_POSES موجود (برای جلوگیری از اضافه‌کردن دوباره‌ی همان کد).
let existingSource = '';
let existingCodes = new Set();
if (existsSync(IMPORTED_POSES_FILE)) {
  existingSource = readFileSync(IMPORTED_POSES_FILE, 'utf8');
  const matches = existingSource.matchAll(/transferCode:\s*'([^']+)'/g);
  for (const m of matches) existingCodes.add(m[1]);
} else {
  existingSource = `import { Pose } from '../types/pose';

/**
 * ژست‌هایی که از «بسته ژست شخصی» (پیامک/چت جدید با کلود) وارد شده‌اند.
 * این فایل جدا از poses.ts نگه‌داری می‌شود چون تابع assignCanonicalPhotos در
 * poses.ts مسیر عکس همه‌ی ژست‌های آن فایل را با الگوی pose-NNN.webp بازنویسی
 * می‌کند؛ ژست‌های این‌جا باید مسیر عکس دست‌نخورده و اصلی خودشان را نگه دارند
 * (مخصوصاً برای حفظ گیف‌های متحرک).
 *
 * این فایل را دستی ویرایش نکن — با «npm run import-pose-pack» ساخته/به‌روزرسانی می‌شود.
 */
export const IMPORTED_POSES: Pose[] = [
];
`;
}

const newPoseEntries = [];
const skipped = [];
let photoCount = 0;

for (const pose of pack.poses) {
  const code = pose.transferCode || pose.id;
  if (existingCodes.has(code)) {
    skipped.push(`${code} (${pose.title}) — قبلاً وارد شده`);
    continue;
  }

  const manifestEntry = pack.photoManifest?.find((m) => m.code === code);
  const filename = manifestEntry?.filename;
  const zipPhoto = filename ? zip.file(`photos/${filename}`) : null;

  let publicImagePath = pose.image; // اگر عکسی پیدا نشد، همان مقدار قبلی (اگر بود) می‌ماند
  let isAnimated = !!pose.isAnimated;

  if (zipPhoto) {
    const bytes = await zipPhoto.async('nodebuffer');
    const originalExt = extOf(filename);
    const animated = isAnimatedExt(originalExt) || pose.isAnimated;
    let outExt = originalExt || 'jpg';
    let outBytes = bytes;

    if (sharp && !animated) {
      try {
        outBytes = await sharp(bytes).webp({ quality: 82 }).toBuffer();
        outExt = 'webp';
      } catch (err) {
        console.warn(`[import-pose-pack] تبدیل ${filename} به webp ناموفق بود، همان فرمت اصلی حفظ می‌شود:`, err.message);
      }
    }

    const outFilename = `imported-${code}.${outExt}`;
    writeFileSync(resolve(PHOTOS_DIR, outFilename), outBytes);
    publicImagePath = `/generated/photos/${outFilename}`;
    isAnimated = animated;
    photoCount += 1;
  }

  newPoseEntries.push({
    ...pose,
    id: `imported-${code}`,
    image: publicImagePath,
    isAnimated: isAnimated || undefined,
    isCustom: false,
    transferCode: code,
  });
}

if (newPoseEntries.length === 0) {
  console.log('هیچ ژست جدیدی برای وارد کردن نبود (همه از قبل وارد شده بودند یا zip خالی بود).');
  console.log(skipped.length ? `رد شده:\n- ${skipped.join('\n- ')}` : '');
  process.exit(0);
}

const entriesTs = newPoseEntries
  .map((p) => `  ${JSON.stringify(p, null, 2).split('\n').join('\n  ')} satisfies Pose,`)
  .join('\n');

const updatedSource = existingSource.replace(
  /export const IMPORTED_POSES: Pose\[\] = \[\n([\s\S]*?)\n\];\n?$/,
  (full, body) => {
    const trimmedBody = body.trim();
    const joined = trimmedBody ? `${trimmedBody}\n${entriesTs}` : entriesTs;
    return `export const IMPORTED_POSES: Pose[] = [\n${joined}\n];\n`;
  }
);

writeFileSync(IMPORTED_POSES_FILE, updatedSource, 'utf8');

// اگر poses.ts هنوز IMPORTED_POSES را merge نکرده، این کار را یک‌بار انجام بده.
let posesSource = readFileSync(POSES_FILE, 'utf8');
if (!posesSource.includes("from './importedPoses'")) {
  posesSource = posesSource.replace(
    "import { REFERENCE_POSES } from './referencePoses';",
    "import { REFERENCE_POSES } from './referencePoses';\nimport { IMPORTED_POSES } from './importedPoses';"
  );
  posesSource = posesSource.replace(
    'export const INITIAL_POSES: Pose[] = keepCoreAndDistinct(ALL_BUILTIN_POSES);',
    '/** ژست‌های وارداتی (بسته ژست شخصی) به‌همان‌شکل خودشان اضافه می‌شوند؛ از\n' +
    ' * assignCanonicalPhotos رد نمی‌شوند تا مسیر عکس (و گیف‌های متحرک) دست‌نخورده بماند. */\n' +
    'export const INITIAL_POSES: Pose[] = [...keepCoreAndDistinct(ALL_BUILTIN_POSES), ...IMPORTED_POSES];'
  );
  writeFileSync(POSES_FILE, posesSource, 'utf8');
  console.log('[import-pose-pack] src/data/poses.ts برای merge کردن IMPORTED_POSES به‌روزرسانی شد.');
}

console.log(`✅ ${newPoseEntries.length} ژست وارد شد (${photoCount} عکس کپی شد).`);
if (skipped.length) console.log(`رد شده (تکراری):\n- ${skipped.join('\n- ')}`);
console.log('حالا این‌ها را انجام بده:');
console.log('  1. نتیجه‌ی src/data/importedPoses.ts را مرور کن.');
console.log('  2. npm run typecheck را اجرا کن.');
console.log('  3. اگر همه‌چیز درست بود، تغییرات را commit کن.');
