import React, { useState } from 'react';
import {
  ChefHat,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  Loader2,
  Phone,
  ShieldCheck,
  Store,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { AuthSession, RestaurantSettings, UserRole } from '../types';
import { FoodImage } from '../components/FoodImage';

interface LoginViewProps {
  settings: RestaurantSettings;
  onLogin: (session: AuthSession) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ settings, onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  // Customer Login State
  const [customerName, setCustomerName] = useState('Karthick Shalini');
  const [customerPhone, setCustomerPhone] = useState('+91 98400 77210');
  const [customerPassword, setCustomerPassword] = useState('guest123');

  // Restaurant Staff Login State
  const [staffEmail, setStaffEmail] = useState('manager@spicesizzle.in');
  const [staffPassword, setStaffPassword] = useState('POS@2026');
  const [staffTitle, setStaffTitle] = useState<'Restaurant Manager' | 'Head Chef' | 'Cashier'>(
    'Restaurant Manager'
  );

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSwitch = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedRole === 'user') {
      if (!customerName.trim() || !customerPhone.trim() || !customerPassword.trim()) {
        setErrorMsg('Please enter your name, phone number, and password to continue.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onLogin({
          role: 'user',
          name: customerName.trim(),
          identifier: customerPhone.trim(),
        });
      }, 300);
    } else {
      if (!staffEmail.trim() || !staffPassword.trim()) {
        setErrorMsg('Please enter your restaurant staff ID/email and access password.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onLogin({
          role: 'restaurant',
          name:
            staffTitle === 'Head Chef'
              ? 'Chef Raghavan'
              : staffTitle === 'Cashier'
                ? 'Kavya Menon'
                : 'Arjun Krishnan',
          identifier: staffEmail.trim(),
          staffTitle,
        });
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col lg:flex-row">
      {/* Left Editorial Culinary Showcase Panel */}
      <div className="lg:w-[46%] bg-gradient-to-br from-[#3D0A14] via-[#5C1422] to-[#171315] text-[#FAF6F0] p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #D4AF37 0%, transparent 45%), radial-gradient(circle at 85% 80%, #EA580C 0%, transparent 50%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-[#D4AF37]/45 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="font-display text-xl font-bold tracking-wide text-white">
              {settings.name}
            </p>
            <p className="text-xs text-[#E4D1D5]">{settings.tagline}</p>
          </div>
        </div>

        <div className="relative z-10 my-10 space-y-6">
          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight text-balance">
              Authentic Indian Dining &amp; Kitchen Management
            </h1>
            <p className="text-sm text-[#E4D1D5] max-w-md leading-relaxed">
              Sign in to the Customer Portal to explore our freshly crafted dishes and track live
              orders, or open the Restaurant POS Console to manage kitchen tickets and GST billing.
            </p>
          </div>

          {/* Curated Food Photo Strip */}
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/15">
              <FoodImage
                src="/src/assets/images/food_masala_dosa_1795094985396.jpg"
                alt="Masala Dosa"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/15">
              <FoodImage
                src="/src/assets/images/food_chicken_biryani_1795094992027.jpg"
                alt="Chicken Biryani"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/15">
              <FoodImage
                src="/src/assets/images/food_paneer_butter_masala_1795094992266.jpg"
                alt="Paneer Butter Masala"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-[#CDB6BB] flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{settings.address}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{settings.phone}</span>
        </div>
      </div>

      {/* Right Dual-Role Login Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E6DDD0] shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1F1618]">
              Select Portal to Sign In
            </h2>
            <p className="text-xs text-[#6E5C60] mt-1">
              Separate secure access for Dining Guests and Restaurant Staff
            </p>
          </div>

          {/* Portal Switcher: User vs Restaurant */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-[#F3ECE2]">
            <button
              type="button"
              onClick={() => handleRoleSwitch('user')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedRole === 'user'
                  ? 'bg-[#5C1422] text-white shadow-xs'
                  : 'text-[#5A494C] hover:text-[#1F1618]'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>User / Customer</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSwitch('restaurant')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedRole === 'restaurant'
                  ? 'bg-[#171315] text-white shadow-xs'
                  : 'text-[#5A494C] hover:text-[#1F1618]'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Restaurant Side</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedRole === 'user' ? (
              <>
                <div className="rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] p-3.5 text-xs text-[#5A494C]">
                  <p className="font-semibold text-[#5C1422]">Customer Dining Portal</p>
                  <p className="mt-0.5">
                    Browse food photography menu, place Dine-in / Takeaway orders &amp; track live
                    kitchen status.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8A7579] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8A7579] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98400 77210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm font-mono tabular-nums text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#8A7579] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7579] hover:text-[#1F1618]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl bg-[#171315] text-[#FAF6F0] p-3.5 text-xs">
                  <p className="font-semibold text-[#F59E0B] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Restaurant Staff &amp; POS Console</span>
                  </p>
                  <p className="mt-0.5 text-[#C8B9BD]">
                    Full access to Kitchen Display, Order Management, GST Billing, Reports &amp;
                    Settings.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                    Staff Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Restaurant Manager', 'Head Chef', 'Cashier'] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setStaffTitle(role)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition-colors ${
                          staffTitle === role
                            ? 'bg-[#5C1422] text-white border-[#5C1422]'
                            : 'bg-[#FAF6F0] text-[#5A494C] border-[#E6DDD0] hover:border-[#5C1422]'
                        }`}
                      >
                        {role === 'Restaurant Manager' ? 'Manager' : role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                    Staff Email / ID
                  </label>
                  <div className="relative">
                    <ChefHat className="w-4 h-4 text-[#8A7579] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="manager@spicesizzle.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A494C] mb-1.5">
                    POS Access Password / PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#8A7579] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Enter POS password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DDD0] text-sm text-[#1F1618] focus:outline-none focus:border-[#5C1422]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7579] hover:text-[#1F1618]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {errorMsg && (
              <p className="text-xs font-medium text-[#B91C1C] bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-3.5 py-2">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'user'
                  ? 'bg-[#EA580C] hover:bg-[#D94E07]'
                  : 'bg-[#5C1422] hover:bg-[#450D18]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : selectedRole === 'user' ? (
                <span>Sign In as Customer</span>
              ) : (
                <span>Sign In to Restaurant POS</span>
              )}
            </button>

            <p className="text-[11px] text-center text-[#8A7579]">
              Pre-filled demo credentials are ready — click Sign In or enter your own details.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
