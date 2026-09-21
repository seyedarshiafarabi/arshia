import { Court, TimeSlot } from '../types';

export const CLUB_INFO = {
  name: 'north.tennisclub',
  nameFa: 'north.tennisclub',
  instagram: '@north.tennisclub',
  instagramUrl: 'https://instagram.com/north.tennisclub',
  phone: '09115846090',
  phoneDisplay: '۰۹۱۱۵۸۴۶۰۹۰',
  whatsappUrl: 'https://wa.me/989115846090',
  locationFa: 'مازندران، حومه سرسبز بابل، مجموعه ورزشی north.tennisclub',
  workingHours: 'همه روزه از ۸:۰۰ صبح الی ۲۴:۰۰ بامداد',
  basePriceRange: '۴۰۰ تا ۶۵۰ هزار تومان (بسته به نوع زمین و سانس روز/شب)',
};

export const COURTS: Court[] = [
  {
    id: 'clay',
    name: 'Clay Court',
    nameFa: 'زمین خاک رس کلاسیک',
    subtitleFa: 'خاک سرخ استاندارد تنیس با زهکشی مهندسی‌شده',
    descriptionFa: 'ایده‌آل برای علاقه‌مندان به تنیس کلاسیک با بالاترین کیفیت خاک سرخ، خط‌کشی دقیق و کشسانی عالی جهت حفظ مفاصل زانو و مچ پا.',
    surface: 'خاک سرخ طبیعی (Red Clay)',
    badge: 'تنیس کلاسیک',
    badgeColor: 'from-amber-600 to-orange-700',
    dayPrice: 500000,
    nightPrice: 600000,
    features: [
      'خاک سرخ فرآوری‌شده استاندارد',
      'نورافکن‌های LED بدون سایه شبانه',
      'امکان کرایه راکت و توپ',
      'امکان رزرو مربی رسمی فدراسیون',
    ],
    dimensions: 'ابعاد استاندارد مسابقات بین‌المللی ITF (۲۳.۷۷ × ۱۰.۹۷ متر)',
  },
  {
    id: 'padel',
    name: 'Padel Court',
    nameFa: 'زمین اختصاصی پدل شیشه‌ای',
    subtitleFa: 'دیواره‌های شیشه‌ای سکوریت ۱۰ میل و چمن مصنوعی فیبریلیت',
    descriptionFa: 'مدرن‌ترین کورت پدل منطقه با شیشه‌های ایمن، چمن آبی و قرمز ضدسایش و تور تخصصی؛ انتخابی بی‌نظیر برای بازی‌های ۲ و ۴ نفره هیجان‌انگیز.',
    surface: 'شیشه سکوریت ۱۰ میل + چمن تخصصی پدل',
    badge: 'پدل مدرن',
    badgeColor: 'from-blue-600 to-cyan-700',
    dayPrice: 550000,
    nightPrice: 650000,
    features: [
      'کورت محصور شیشه‌ای ۱۰ میل پانوراما',
      'سیستم روشنایی پیرامونی پیشرفته',
      'تأمین راکت‌های تخصصی پدل',
      'کافه اختصاصی مجاور کورت',
    ],
    dimensions: 'استاندارد جهانی پدل (۲۰ × ۱۰ متر)',
  },
  {
    id: 'beach',
    name: 'Beach Tennis Court',
    nameFa: 'زمین ساحلی و ورزش‌های ماسه‌ای',
    subtitleFa: 'تنیس ساحلی، فوتوالی و والیبال با ماسه شسته‌شده نرم',
    descriptionFa: 'فضایی شبیه‌سازی‌شده از سواحل کاسپین برای عاشقان تنیس ساحلی و بازی روی ماسه بدون خطر آسیب‌دیدگی؛ حس نسیم شمال و ورزش پرانرژی.',
    surface: 'ماسه دانه‌بندی شده نرم و سیستم خنک‌کننده',
    badge: 'ورزش ساحلی',
    badgeColor: 'from-emerald-600 to-teal-800',
    dayPrice: 400000,
    nightPrice: 500000,
    features: [
      'ماسه رودخانه‌ای دابل واش نرم',
      'دوش‌های فضای باز جهت شستشو',
      'تجهیزات مخصوص تنیس ساحلی',
      'محیط باز با هوای مطبوع بابل',
    ],
    dimensions: 'استاندارد فدراسیون بین‌المللی تنیس ساحلی (۱۶ × ۸ متر)',
  },
];

export const TIME_SLOT_DEFINITIONS = [
  { start: '08:00', end: '09:30', isNight: false },
  { start: '09:30', end: '11:00', isNight: false },
  { start: '11:00', end: '12:30', isNight: false },
  { start: '15:00', end: '16:30', isNight: false },
  { start: '16:30', end: '18:00', isNight: false },
  { start: '18:00', end: '19:30', isNight: true },
  { start: '19:30', end: '21:00', isNight: true },
  { start: '21:00', end: '22:30', isNight: true },
  { start: '22:30', end: '24:00', isNight: true },
];

// Helper to generate seed slots for a given date
export function generateDaySlots(court: Court, dateStr: string): TimeSlot[] {
  return TIME_SLOT_DEFINITIONS.map((def) => {
    const id = `${court.id}_${dateStr}_${def.start.replace(':', '')}`;
    const price = def.isNight ? court.nightPrice : court.dayPrice;

    // Seed realistic pre-booked slots based on date and hour to make schedule lively
    // For example, popular peak hours (19:30 or 21:00) on some days are booked
    const hash = (dateStr + def.start + court.id)
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isBooked = hash % 5 === 0; // ~20% pre-booked slots for realistic MVP demo

    return {
      id,
      courtId: court.id,
      dateStr,
      startTime: def.start,
      endTime: def.end,
      price,
      isNight: def.isNight,
      isBooked,
      reservationCode: isBooked ? `NTC-${(hash % 9000) + 1000}` : undefined,
    };
  });
}
