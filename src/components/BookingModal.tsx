import React, { useState, useEffect, useRef } from 'react';
import { Court, TimeSlot, Booking } from '../types';
import { formatToman, toPersianDigits, getFullPersianDate } from '../utils/dateUtils';
import { normalizeIranianMobile, isValidIranianMobile } from '../utils/phoneUtils';
import { CLUB_INFO } from '../data/courtsData';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Sparkles,
  Award,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  court: Court | null;
  dateStr: string;
  selectedSlots: TimeSlot[];
  onClose: () => void;
  onConfirmBooking: (
    bookingData: Omit<Booking, 'reservationCode' | 'createdAt' | 'status'>
  ) => void;
  onReleaseHold: (slotIds: string[]) => void;
}

const TOTAL_HOLD_SECONDS = 300; // 5 minutes = 300 seconds

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  court,
  dateStr,
  selectedSlots,
  onClose,
  onConfirmBooking,
  onReleaseHold,
}) => {
  // Step 1: User details, Step 2: Online Bank Payment
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields - Only 2 required as requested: Full Name & Mobile
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [needsRacket, setNeedsRacket] = useState(false);
  const [needsCoach, setNeedsCoach] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Payment Gateway Simulator State
  const [cardNumber, setCardNumber] = useState('۶۰۳۷-۹۹۷۴-۸۵۱۲-۴۳۱۶');
  const [cvv2, setCvv2] = useState('۴۸۲');
  const [expMonth, setExpMonth] = useState('۰۸');
  const [expYear, setExpYear] = useState('۰۶');
  const [dynamicPin, setDynamicPin] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // 5-Minute Countdown Timer State
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_HOLD_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const remainingFromSlot = selectedSlots[0]?.heldUntil
        ? Math.max(0, Math.floor((selectedSlots[0].heldUntil - Date.now()) / 1000))
        : TOTAL_HOLD_SECONDS;
      setSecondsLeft(remainingFromSlot > 0 ? remainingFromSlot : TOTAL_HOLD_SECONDS);
      setErrorMessage('');
      setOtpSent(false);
      setDynamicPin('');
      setIsProcessingPayment(false);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  // Handle timer expiration
  const isExpired = secondsLeft === 0;

  if (!isOpen || !court || selectedSlots.length === 0) return null;

  // Base slots price
  const baseSlotsPrice = selectedSlots.reduce((sum, s) => sum + s.price, 0);
  const racketFee = needsRacket ? 50000 * selectedSlots.length : 0;
  const coachFee = needsCoach ? 200000 * selectedSlots.length : 0;
  const totalPrice = baseSlotsPrice + racketFee + coachFee;
  const priceInRials = totalPrice * 10;

  // Sort slots by start time
  const sortedSlots = [...selectedSlots].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );
  const timeRange = `${toPersianDigits(sortedSlots[0].startTime)} تا ${toPersianDigits(
    sortedSlots[sortedSlots.length - 1].endTime
  )}`;

  // Format timer minutes and seconds
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedMinutes = toPersianDigits(String(minutes).padStart(2, '0'));
  const formattedSeconds = toPersianDigits(String(seconds).padStart(2, '0'));
  const progressPercent = (secondsLeft / TOTAL_HOLD_SECONDS) * 100;

  const handleClose = () => {
    onReleaseHold(selectedSlots.map((s) => s.id));
    onClose();
  };

  // Step 1 validation -> Go to Payment Step
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) {
      setErrorMessage('زمان قفل ۵ دقیقه‌ای سانس به پایان رسیده است.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('لطفاً نام و نام خانوادگی خود را وارد فرمایید.');
      return;
    }
    const cleanPhone = normalizeIranianMobile(customerPhone);
    if (!isValidIranianMobile(cleanPhone)) {
      setErrorMessage('لطفاً یک شماره همراه معتبر ۱۱ رقمی (مانند ۰۹۱۱۱۲۳۴۵۶۷) وارد فرمایید.');
      return;
    }

    setErrorMessage('');
    setStep(2);
  };

  // Request Dynamic SMS OTP
  const handleRequestOtp = () => {
    setIsRequestingOtp(true);
    setTimeout(() => {
      setIsRequestingOtp(false);
      setOtpSent(true);
      const generatedOtp = String(Math.floor(10000 + Math.random() * 90000));
      setDynamicPin(toPersianDigits(generatedOtp));
    }, 800);
  };

  // Quick 1-click test payment
  const handleQuickTestPayment = () => {
    handleExecutePayment();
  };

  // Complete Payment and Confirm Booking
  const handleExecutePayment = () => {
    if (isExpired) {
      setErrorMessage('زمان ۵ دقیقه‌ای رزرو منقضی شده است.');
      return;
    }

    setIsProcessingPayment(true);
    setErrorMessage('');

    setTimeout(() => {
      const transactionRef = `SHP-${Math.floor(10000000 + Math.random() * 90000000)}`;

      onConfirmBooking({
        courtId: court.id,
        courtName: court.nameFa,
        dateStr,
        dateLabelFa: getFullPersianDate(dateStr),
        slotIds: selectedSlots.map((s) => s.id),
        timeRange,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        needsRacket,
        needsCoach,
        totalPrice,
        paymentStatus: 'paid',
        transactionRef,
      });

      setIsProcessingPayment(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-900/50 backdrop-blur-md animate-fade-in">
      <div
        id="booking-modal-card"
        className="w-full max-w-xl bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-3xl shadow-2xl overflow-hidden my-auto ring-1 ring-stone-900/10 flex flex-col max-h-[94vh]"
      >
        {/* Top 5-Minute Hold Countdown Banner */}
        <div
          className={`px-4 py-3 border-b text-xs flex items-center justify-between transition-colors ${
            isExpired
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : secondsLeft < 60
              ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
              : 'bg-sky-50/90 border-sky-200 text-sky-900'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isExpired
                ? 'زمان قفل موقت سانس به پایان رسید!'
                : 'این سانس‌ها ۵ دقیقه برای شما قفل موقت شده‌اند:'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`font-black text-sm px-2.5 py-0.5 rounded-lg border ${
                isExpired
                  ? 'bg-rose-100 border-rose-300 text-rose-800'
                  : secondsLeft < 60
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-extrabold'
                  : 'bg-lime-300 border-lime-400 text-stone-950 shadow-xs'
              }`}
            >
              {formattedMinutes}:{formattedSeconds}
            </span>
          </div>
        </div>

        {/* Linear progress bar of remaining hold time */}
        <div className="w-full bg-stone-100 h-1">
          <div
            className={`h-full transition-all duration-1000 ${
              isExpired
                ? 'bg-rose-500 w-0'
                : secondsLeft < 60
                ? 'bg-amber-500'
                : 'bg-sky-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200/80 bg-stone-50/80">
          <div>
            <div className="text-[11px] font-bold text-sky-800 mb-0.5 flex items-center gap-1.5">
              <span className="font-mono dir-ltr">{CLUB_INFO.name}</span>
              <span>•</span>
              <span className="text-stone-500 font-normal">
                {step === 1 ? 'مرحله ۱ از ۲: مشخصات' : 'مرحله ۲ از ۲: پرداخت شاپرک'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-stone-900">
              رزرو {court.nameFa}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shadow-xs touch-manipulation"
            title="بستن و آزادسازی سانس"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Reservation Summary Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50/90 border border-stone-200/80 space-y-2.5 text-xs sm:text-sm shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>تاریخ:</span>
              </span>
              <span className="font-bold text-stone-900">
                {getFullPersianDate(dateStr)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>ساعت سانس:</span>
              </span>
              <span className="font-bold text-stone-900 dir-ltr">
                {timeRange} ({toPersianDigits(selectedSlots.length)} سانس)
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
              <span className="text-stone-600 font-bold">هزینه سانس:</span>
              <span className="font-black text-sky-800 text-base">
                {formatToman(totalPrice)}
              </span>
            </div>
          </div>

          {/* Expired State Notice */}
          {isExpired ? (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-black text-rose-900 text-sm">
                مهلت ۵ دقیقه‌ای پرداخت شما به پایان رسید
              </h3>
              <p className="text-xs text-rose-700 leading-relaxed max-w-sm mx-auto">
                جهت رعایت حق سایر ورزشکاران، سانس‌های قفل شده به صورت خودکار آزاد شدند. لطفاً مجدداً سانس مورد نظر را انتخاب فرمایید.
              </p>
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>انتخاب مجدد سانس</span>
              </button>
            </div>
          ) : step === 1 ? (
            /* STEP 1: Quick Customer Info (No registration needed) */
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Optional Addons */}
              <div className="space-y-2">
                <label className="text-xs font-black text-stone-900 block">
                  امکانات جانبی باشگاه (اختیاری):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all touch-manipulation ${
                      needsRacket
                        ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-xs'
                        : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={needsRacket}
                      onChange={(e) => setNeedsRacket(e.target.checked)}
                      className="mt-0.5 accent-sky-600 rounded w-4 h-4"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>کرایه راکت و توپ</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        (+۵۰,۰۰۰ تومان به ازای هر سانس)
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all touch-manipulation ${
                      needsCoach
                        ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-xs'
                        : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={needsCoach}
                      onChange={(e) => setNeedsCoach(e.target.checked)}
                      className="mt-0.5 accent-sky-600 rounded w-4 h-4"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-sky-600" />
                        <span>مربیگری و تمرین</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        (+۲۰۰,۰۰۰ تومان به ازای هر سانس)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Mandatory Fields: Only Name & Phone */}
              <div className="space-y-3.5 pt-1">
                <div>
                  <label
                    htmlFor="customer-name-input"
                    className="block text-xs font-black text-stone-800 mb-1.5 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-600" />
                      <span>۱. نام و نام خانوادگی کامل</span>
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold">الزامی</span>
                  </label>
                  <input
                    id="customer-name-input"
                    type="text"
                    required
                    placeholder="مثال: کیانوش رستمی"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-stone-50/90 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-sky-600 focus:bg-white text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-phone-input"
                    className="block text-xs font-black text-stone-800 mb-1.5 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-sky-600" />
                      <span>۲. شماره همراه</span>
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold">الزامی</span>
                  </label>
                  <input
                    id="customer-phone-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    placeholder="مثال: ۰۹۱۱۱۲۳۴۵۶۷"
                    value={customerPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Normalize input instantaneously
                      setCustomerPhone(normalizeIranianMobile(val));
                    }}
                    className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-stone-50/90 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-sky-600 focus:bg-white text-sm dir-ltr text-right font-bold tracking-wider"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    * بدون نیاز به ثبت‌نام یا رمز عبور؛ پیامک و فاکتور به این شماره ارسال می‌شود.
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-1/3 min-h-[46px] px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-transparent text-stone-700 text-xs sm:text-sm font-bold transition-all touch-manipulation"
                >
                  انصراف و لغو
                </button>

                <button
                  id="go-to-payment-step-btn"
                  type="submit"
                  className="w-2/3 min-h-[46px] px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-1.5 touch-manipulation"
                >
                  <span>ورود به درگاه پرداخت شاپرک</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Online Bank Payment Gateway (Shaparak / Shetab Simulator) */
            <div className="space-y-4">
              {/* Shaparak Gateway Header Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-lime-400" />
                    <span className="text-xs font-bold tracking-wide">
                      درگاه امن پرداخت الکترونیک شاپرک
                    </span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    SSL 256-Bit
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[11px] text-blue-200">پذیرنده اینترنتی:</div>
                    <div className="font-extrabold text-sm font-mono dir-ltr">{CLUB_INFO.name}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] text-blue-200">مبلغ قابل پرداخت:</div>
                    <div className="text-base font-black text-lime-300">
                      {formatToman(totalPrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick 1-Click Test Payment Option */}
              <div className="p-3 rounded-2xl bg-sky-50/90 border border-sky-300 text-sky-950 flex items-center justify-between gap-3 shadow-xs">
                <div className="text-xs">
                  <div className="font-extrabold flex items-center gap-1 text-sky-950">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>پرداخت آزمایشی سریع (نسخه تستی)</span>
                  </div>
                  <div className="text-[11px] text-sky-800 mt-0.5">
                    تأیید فوری تراکنش بدون نیاز به تایپ مشخصات کارت
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleQuickTestPayment}
                  disabled={isProcessingPayment}
                  className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-stone-950 text-xs font-black shrink-0 shadow-sm transition-all flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
                  <span>پرداخت سریع</span>
                </button>
              </div>

              {/* Card Inputs Form */}
              <div className="space-y-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/90">
                {/* Card Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                    <span>شماره کارت ۱۶ رقمی شتاب:</span>
                    <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-sm dir-ltr text-center font-bold tracking-widest focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* CVV2 and Expiry */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      کد CVV2:
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cvv2}
                      onChange={(e) => setCvv2(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-sm dir-ltr text-center font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      تاریخ انقضا (ماه / سال):
                    </label>
                    <div className="flex items-center gap-1.5 dir-ltr">
                      <input
                        type="text"
                        maxLength={2}
                        value={expMonth}
                        onChange={(e) => setExpMonth(e.target.value)}
                        placeholder="MM"
                        className="w-1/2 min-h-[44px] px-2 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-sm text-center font-bold focus:outline-none focus:border-blue-600"
                      />
                      <span className="text-stone-400 font-bold">/</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={expYear}
                        onChange={(e) => setExpYear(e.target.value)}
                        placeholder="YY"
                        className="w-1/2 min-h-[44px] px-2 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-sm text-center font-bold focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    رمز دوم اینترنتی (پویا):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={dynamicPin}
                      onChange={(e) => setDynamicPin(e.target.value)}
                      placeholder="رمز پویا"
                      className="w-2/3 min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-sm dir-ltr text-center font-bold focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={isRequestingOtp}
                      className="w-1/3 min-h-[44px] px-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-[11px] font-bold transition-colors"
                    >
                      {isRequestingOtp ? 'در حال ارسال...' : otpSent ? 'ارسال شد ✓' : 'دریافت رمز پویا'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Processing Loader or Error */}
              {isProcessingPayment && (
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-300 text-center flex items-center justify-center gap-3 text-sky-900 text-xs font-bold animate-pulse">
                  <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  <span>در حال ارتباط با شاپرک و کسر هزینه سانس تنیس...</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Payment Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  id="final-pay-button"
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessingPayment}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 touch-manipulation"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>تأیید و پرداخت {formatToman(totalPrice)}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isProcessingPayment}
                    className="w-1/2 min-h-[42px] px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors touch-manipulation"
                  >
                    مرحله قبل
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isProcessingPayment}
                    className="w-1/2 min-h-[42px] px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors touch-manipulation flex items-center justify-center gap-1"
                    title="انصراف و آزادسازی سانس در همان لحظه"
                  >
                    <X className="w-3.5 h-3.5 text-rose-600" />
                    <span>انصراف و لغو رزرو</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
