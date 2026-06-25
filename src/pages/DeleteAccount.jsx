import { useState } from "react";
import { ArrowLeft, ShieldAlert, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BrandLogo from "../components/BrandLogo";
import Footer from "../components/Footer";
import { authApi } from "../services/api";

const DeleteAccount = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (!form.password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const requestConfirmation = (event) => {
    event.preventDefault();
    if (validate()) setShowConfirmation(true);
  };

  const deleteAccount = async () => {
    setSubmitting(true);
    try {
      const response = await authApi.deleteAccount({
        email: form.email.trim(),
        password: form.password,
      });

      toast.success(
        response?.data?.message ||
          "Account deletion request submitted successfully"
      );
      setShowConfirmation(false);
      setForm({ email: "", password: "" });
    } catch (error) {
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message;
      const message =
        status === 400 || status === 401 || status === 403
          ? "Invalid email or password"
          : backendMessage || "Unable to submit account deletion request";

      toast.error(message);
      setShowConfirmation(false);
      setForm((current) => ({ ...current, password: "" }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="bg-slate-950 px-4 py-4 text-white md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <BrandLogo size="sm" />
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white transition-colors hover:border-[#ff7438] hover:text-[#ff7438]"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
        </div>
      </header>

      <main className="px-4 py-12 md:px-6">
        <article className="mx-auto max-w-4xl">
          <p className="text-sm font-black uppercase text-[#ff7438]">
            RentalChaavi
          </p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">
            Delete Your Account
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Enter your registered email and password to request deletion of
            your RentalChaavi account.
          </p>

          <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#f97316]">
                <Trash2 size={21} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Delete Your Account
                </h2>
                <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-700">
                  <p>
                    At RentalChaavi, we respect your privacy and give you
                    control over your account information. If you no longer
                    wish to use our services, you can request account deletion
                    by verifying your registered email and password.
                  </p>
                  <p>
                    Once your request is submitted, your profile details,
                    login access, saved properties, liked properties, messages,
                    premium access, and account-related information may be
                    removed from our platform.
                  </p>
                  <p>
                    Some information may be retained where required for legal,
                    payment, security, dispute resolution, or compliance
                    purposes.
                  </p>
                  <p>
                    Before deleting your account, make sure there are no active
                    rental requests, pending payments, ongoing property
                    discussions, or unresolved service issues.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={requestConfirmation}
              className="mt-8 border-t border-slate-200 pt-8"
              noValidate
            >
              <div className="grid gap-6">
                <label className="block">
                  <span className="text-sm font-bold text-slate-800">
                    Email Address
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="Enter your registered email"
                    autoComplete="email"
                    className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-orange-100 ${
                      errors.email ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {errors.email && (
                    <span className="mt-1 block text-sm text-red-600">
                      {errors.email}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-800">
                    Password
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={updateField}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`mt-2 w-full rounded-lg border bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-orange-100 ${
                      errors.password ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {errors.password && (
                    <span className="mt-1 block text-sm text-red-600">
                      {errors.password}
                    </span>
                  )}
                </label>
              </div>

              <button
                type="submit"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#f97316] px-5 py-3 font-bold text-white transition-colors hover:bg-[#ea580c] sm:w-auto"
              >
                <Trash2 size={18} />
                Request Account Deletion
              </button>
            </form>
          </section>
        </article>
      </main>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />

      {showConfirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <ShieldAlert size={24} />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={submitting}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close confirmation"
              >
                <X size={20} />
              </button>
            </div>

            <h2
              id="delete-account-title"
              className="mt-5 text-2xl font-black text-slate-950"
            >
              Are you sure you want to delete your RentalChaavi account?
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              This action may permanently remove your account access, saved
              properties, liked properties, messages, and rental history.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={submitting}
                className="rounded-lg border border-slate-300 px-4 py-3 font-bold text-slate-800 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteAccount}
                disabled={submitting}
                className="rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Deleting..." : "Yes, Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;
