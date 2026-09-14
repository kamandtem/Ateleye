export type CategoryType =
  | 'عروس و داماد'
  | 'عروس'
  | 'داماد'
  | 'زوج'
  | 'گروهی';

export type PoseType =
  | 'ایستاده'
  | 'نشسته'
  | 'راه رفتن'
  | 'بغل کردن'
  | 'رمانتیک'
  | 'رسمی'
  | 'خلاقانه'
  | 'حرکتی';

export type DifficultyLevel = 'آسان' | 'متوسط' | 'حرفه‌ای';

/** لوکیشن‌های اصلی برنامه */
export type LocationType = 'جنوب' | 'ساحل' | 'شمال' | 'کویر' | 'شهر' | 'باغ عمارت';

/**
 * زیردسته‌های «باغ عمارت» — بر اساس توالی واقعی کار تصویربردار سر صحنه.
 * این فیلد فقط برای لوکیشن «باغ عمارت» معنا دارد (نه یک enum عمومی برای همه لوکیشن‌ها).
 */
export type GardenSubCategory =
  | 'جزئیات و دکور'
  | 'آماده شدن عروس'
  | 'آماده شدن داماد'
  | 'بهم رسیدن زوج'
  | 'پرتره زوج'
  | 'خانواده و گروهی'
  | 'رقص و شادی'
  | 'شب و بدرقه';

export const GARDEN_SUB_CATEGORIES: GardenSubCategory[] = [
  'جزئیات و دکور',
  'آماده شدن عروس',
  'آماده شدن داماد',
  'بهم رسیدن زوج',
  'پرتره زوج',
  'خانواده و گروهی',
  'رقص و شادی',
  'شب و بدرقه',
];

/**
 * نوع تصویرسازی ژست (طرح گرافیکی داخلی و آفلاین).
 * هر کلید یک «صحنه» مشخص است که دقیقاً همان چیزی را نشان می‌دهد که در
 * عنوان و مراحل اجرای ژست نوشته شده؛ نه یک عکس تزئینی بی‌ربط.
 */
export type ArtKey =
  // آغوش و نزدیکی
  | 'backHug'
  | 'backHugLookBack'
  | 'frontHug'
  | 'headOnChest'
  | 'headOnShoulder'
  | 'faceToFace'
  | 'whisper'
  | 'laugh'
  | 'backToBack'
  | 'sideBySide'
  // بوسه‌ها
  | 'forehead'
  | 'kiss'
  | 'kissCheek'
  | 'kissForehead'
  | 'kissHand'
  | 'kissShoulder'
  | 'kissSilhouette'
  // دست‌ها و جزئیات
  | 'handInHand'
  | 'ringFocus'
  | 'handsDetail'
  | 'bouquetLow'
  | 'flatlay'
  | 'dressHem'
  | 'shoeDetail'
  // حرکت
  | 'walk'
  | 'walkAway'
  | 'walkSideBySide'
  | 'runTogether'
  | 'jump'
  | 'splash'
  | 'confetti'
  | 'dance'
  | 'spinTogether'
  | 'dip'
  | 'lift'
  | 'carry'
  | 'twirl'
  | 'veilFly'
  | 'dressFly'
  // نشستن و تکیه دادن
  | 'sitting'
  | 'sitBench'
  | 'sitStairs'
  | 'sitGround'
  | 'sitDune'
  | 'sitRock'
  | 'leanWall'
  | 'leanRail'
  // عروس تنها
  | 'soloBride'
  | 'brideProfile'
  | 'brideBouquet'
  | 'veil'
  | 'brideVeilOut'
  | 'brideVeilIn'
  | 'brideTrain'
  | 'brideWalkAway'
  | 'brideSit'
  | 'brideLookUp'
  | 'brideTwirl'
  // داماد تنها
  | 'soloGroom'
  | 'groomProfile'
  | 'groomButton'
  | 'groomTie'
  | 'groomWatch'
  | 'groomSit'
  | 'groomLean'
  | 'groomWalk'
  // گروهی
  | 'group'
  | 'groupLine'
  | 'groupCircle'
  | 'groupToast'
  | 'family'
  | 'kids'
  // کادرهای باز و خلاقانه
  | 'silhouette'
  | 'twoDots'
  | 'reflection'
  | 'arch'
  | 'window'
  | 'lowAngle'
  | 'starSky'
  | 'nightLights'
  | 'fogWalk';

export interface CameraTips {
  framing: string;
  cameraAngle: string;
  suggestedDistance: string;
  lensSuggestion: string;
  lightTip: string;
}

/** مرحله راحتی سوژه؛ برای مرتب‌سازی ژست‌ها از ساده به سخت */
export type ComfortStage = 'یخ‌شکن' | 'گرم شدن' | 'نزدیک شدن' | 'صمیمی' | 'حرفه‌ای';

export const COMFORT_STAGES: ComfortStage[] = [
  'یخ‌شکن',
  'گرم شدن',
  'نزدیک شدن',
  'صمیمی',
  'حرفه‌ای',
];

export interface Pose {
  id: string;
  title: string;
  category: CategoryType;
  poseType: PoseType;
  difficulty: DifficultyLevel;
  peopleCount: number;
  locations: LocationType[];
  art: ArtKey;
  tags: string[];

  /** تصویر مرجعی که خود کاربر اضافه کرده (dataURL). اختیاری. */
  image?: string;

  /** فقط وقتی یکی از لوکیشن‌ها «باغ عمارت» باشد معنا دارد؛ مرحله‌ی اجرا سر صحنه. */
  gardenSubCategory?: GardenSubCategory;

  /** true اگر تصویر مرجع یک گیف/تصویر متحرک باشد (نه عکس ثابت فشرده‌شده). */
  isAnimated?: boolean;

  steps: string[];
  bodyPosition: string;
  handPosition: string;
  footPosition: string;
  headDirection: string;
  eyeDirection: string;

  photographerScript: string[];
  commonMistakes: string[];
  variations: string[];
  cameraTips: CameraTips;

  /** امتیاز سختی/صمیمیت برای چیدمان «از ساده به سخت» (کمتر = ساده‌تر) */
  ease: number;
  /** برچسب مرحله اجرا سر صحنه */
  stage: ComfortStage;

  /** کد ثابت برای تطبیق عکس بیرونی با ژست هنگام انتقال به نسخه اصلی */
  transferCode?: string;
  isCustom?: boolean;
  createdAt?: number;
  note?: string;
  suggestedMinutes?: number;
}

export interface MyLocation {
  id: string;
  name: string;
  contact?: string;
  address?: string;
  note?: string;
  lat?: number;
  lng?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface FilterState {
  search: string;
  category: CategoryType | 'همه';
  poseType: PoseType | 'همه';
  difficulty: DifficultyLevel | 'همه';
  location: LocationType | 'همه';
  /** فقط وقتی location === 'باغ عمارت' باشد در UI نشان داده می‌شود. */
  gardenSubCategory: GardenSubCategory | 'همه';
  peopleCount: number | null;
  customOnly: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  search: '',
  category: 'همه',
  poseType: 'همه',
  difficulty: 'همه',
  location: 'همه',
  gardenSubCategory: 'همه',
  peopleCount: null,
  customOnly: false,
};


/* ==================== بخش دفتر کار ==================== */

export interface StudioProfile {
  id: string;
  name: string;           /** نام استودیو/اتلیه */
  phone: string;          /** شماره تماس */
  craftCode: string;      /** شماره صنفی */
  address?: string;
  logo?: string;          /** dataURL of logo */
  bankName?: string;
  accountNumber?: string;
  createdAt: number;
  updatedAt: number;
}

export type CameraType =
  | 'دوربین فیلم‌برداری'
  | 'دوربین عکاسی'
  | 'رونین'
  | 'هلی‌شات'
  | 'FPV'
  | 'کرین'
  | 'نور و صدابرداری'
  | 'دستی'
  | 'عکاسی'
  | 'لرزشگیر';
export type ServiceType =
  | 'فیلم‌برداری و تدوین'
  | 'عکاسی باغ'
  | 'عکاسی مراسم'
  | 'فرمالیته شهری'
  | 'فرمالیته اطراف شهر'
  | 'فرمالیته شمال یا جنوب'
  | 'عقد محضری'
  | 'آلبوم'
  | 'چاپ عکس'
  | 'پخش کلیپ در مراسم'
  | 'اسلایدشو و ادیت عکس'
  | 'تحویل آرشیو عکس'
  | 'ورودی آتلیه'
  | 'ورودی باغ و عمارت'
  | 'میکس'
  | 'عکس سر مجلسی'
  | 'TV اسلاید';
export type LocationTypeFormatted = 'محلی' | 'شمال' | 'جنوب' | 'باغ عمارت';
export type ThemeType = 'شاد و اکتیو' | 'ارامش' | 'عاشقانه احساسی';

export interface Ceremony {
  id: string;
  date: string;           /** ISO date */
  location?: string;
  cameras: Partial<Record<CameraType, number>>; /** camera -> count */
  services: Partial<Record<ServiceType, { checked: boolean; notes?: string }>>;
  createdAt: number;
  updatedAt: number;
}

export interface Formality {
  id: string;
  location?: string;      /** نام لوکیشن ضبط */
  recordDate: string;     /** ISO date */
  cameras: Partial<Record<Exclude<CameraType, 'کرین'>, number>>;
  clipType?: LocationTypeFormatted;
  theme?: ThemeType;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectInvoice {
  id: string;
  items: Array<{ name: string; count: number; price: number }>;  /** price per unit in تومان */
  deposit?: number;
  discount?: number;
  notes?: string;
  status?: 'draft' | 'final';
  customerName?: string;
  total: number;
  createdAt: number;
  updatedAt: number;
}

export interface OfficeCustomer {
  brideName?: string;
  brideNationalId?: string;
  bridePhone?: string;
  groomName?: string;
  groomNationalId?: string;
  groomPhone?: string;
  address?: string;
}

export interface OfficeProject {
  id: string;
  name: string;           /** نام پروژه */
  customer?: OfficeCustomer;
  eventType?: 'عقد' | 'عروسی' | 'عقد و عروسی' | 'فرمالیته';
  startTime?: string;
  endTime?: string;
  overtimeRate?: number;
  paymentPlan?: 'نقد' | 'سه ماهه' | 'پنج ماهه';
  contractNotes?: string;
  ceremony?: Ceremony;    /** اختیاری */
  formality?: Formality;  /** اختیاری */
  ceremonyInvoice?: ProjectInvoice;
  formalityInvoice?: ProjectInvoice;
  createdAt: number;
  updatedAt: number;
}

/* درآمد پروژه = مجموع فاکتور‌های موجود */
export interface ProjectRevenue {
  ceremonyTotal: number;
  formalityTotal: number;
  totalRevenue: number;
}
export interface InvoiceRecord {
  id: string;
  title: string;
  customerName: string;
  date: string;           /** ISO date */
  items: Array<{ name: string; count: number; price: number }>;
  total: number;
  createdAt: number;
  updatedAt: number;
}

export type ViewTab =
  | 'home'
  | 'library'
  | 'locations'
  | 'mylocations'
  | 'weather'
  | 'favorites'
  | 'myposes'
  | 'office'
  | 'office-project-detail'
  | 'principles'
  | 'settings'
  | 'checklist'
  | 'detail';
