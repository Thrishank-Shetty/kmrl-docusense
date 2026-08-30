import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your work email.");
      return;
    }

    setLoading(true);

    try {
      const username =
        form.username.trim() || form.email.trim();

      await api.post("/auth/register", {
        username,
        email: form.email.trim(),
        password: form.password,
      });

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      console.error("Registration failed:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F4F6]">

      {/* LEFT SIDE */}
      <div
        className="relative hidden h-screen w-1/2 bg-cover bg-center text-white md:flex"
        style={{
          backgroundImage: "url('/kmrl-register-bg.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-[#002D62]/85" />

        <div className="relative z-10 flex w-full flex-col justify-center px-16">
          <h1 className="flex items-center gap-3 text-[30px] font-bold">
            ▰ KMRL DocuSense
          </h1>

          <h2 className="mt-8 max-w-[500px] text-[19px] font-semibold leading-relaxed">
            Infrastructure Intelligence powered by precise
            <br />
            document extraction and analytics.
          </h2>

          <div className="mt-8 flex gap-3">
            <span className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-[10px]">
              <span className="text-[#10B981]">●</span>{" "}
              Secure Architecture
            </span>

            <span className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-[10px]">
              ↗ High-Speed Extraction
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex h-screen w-full items-center justify-center overflow-y-auto px-10 md:w-1/2">
        <div className="w-full max-w-[460px] py-8">

          {/* HEADING */}
          <div className="mb-5">
            <h2 className="text-[22px] font-bold text-[#111827]">
              Create Your Account
            </h2>

            <p className="mt-1 text-[11px] text-[#1E293B]/65">
              Register for secure access to enterprise document analytics.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[10px] leading-relaxed text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-[10px] leading-relaxed text-green-600">
                {success}
              </p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}
            <label className="mb-1 block text-[10px] font-semibold text-[#1E293B]">
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
              disabled={loading}
              className="mb-3 h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[12px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#0056B3] focus:ring-2 focus:ring-[#0056B3]/10 disabled:bg-slate-50"
            />

            {/* USERNAME */}
            <label className="mb-1 block text-[10px] font-semibold text-[#1E293B]">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              disabled={loading}
              className="mb-2 h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[12px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#0056B3] focus:ring-2 focus:ring-[#0056B3]/10 disabled:bg-slate-50"
            />

            <p className="mb-3 text-[9px] text-slate-400">
              If left empty, your email will be used as the username.
            </p>

            {/* EMAIL */}
            <label className="mb-1 block text-[10px] font-semibold text-[#1E293B]">
              Work Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@kmrl.co.in"
              required
              disabled={loading}
              className="mb-3 h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[12px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#0056B3] focus:ring-2 focus:ring-[#0056B3]/10 disabled:bg-slate-50"
            />

            {/* DEPARTMENT */}
            <label className="mb-1 block text-[10px] font-semibold text-[#1E293B]">
              Department
            </label>

            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              disabled={loading}
              className="mb-3 h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[12px] text-[#1E293B] outline-none focus:border-[#0056B3] focus:ring-2 focus:ring-[#0056B3]/10 disabled:bg-slate-50"
            >
              <option value="">Select your department</option>
              <option value="Operations">Operations</option>
              <option value="Engineering">Engineering</option>
              <option value="Finance">Finance</option>
              <option value="Human Resources">
                Human Resources
              </option>
              <option value="IT">IT</option>
              <option value="Administration">
                Administration
              </option>
            </select>

            {/* PASSWORDS */}
            <div className="mb-3 grid grid-cols-2 gap-4">

              {/* PASSWORD */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-[#1E293B]">
                  Password
                </label>

                <input
                  type={show ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[12px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#0056B3] focus:ring-2 focus:ring-[#0056B3]/10 disabled:bg-slate-50"
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-[#1E293B]">
                  Confirm Password
                </label>

                <input
                  type={show ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[12px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#0056B3] focus:ring-2 focus:ring-[#0056B3]/10 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* SHOW PASSWORD */}
            <label className="mb-3 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={show}
                onChange={() => setShow((prev) => !prev)}
                disabled={loading}
                className="h-3.5 w-3.5 accent-[#0056B3]"
              />

              <span className="text-[10px] text-[#1E293B]/70">
                Show passwords
              </span>
            </label>

            {/* PRIVACY */}
            <label className="mb-4 flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                required
                disabled={loading}
                className="mt-0.5 h-3.5 w-3.5 accent-[#0056B3]"
              />

              <span className="text-[10px] leading-relaxed text-[#1E293B]/70">
                I agree to the{" "}
                <span className="font-medium text-[#0056B3]">
                  KMRL Data Privacy Policy
                </span>{" "}
                and{" "}
                <span className="font-medium text-[#0056B3]">
                  Terms of Use.
                </span>
              </span>
            </label>

            {/* REGISTER */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-[#002D62] text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#0056B3] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? "Creating Account..."
                : "Create Account →"}
            </button>
          </form>

          {/* LOGIN */}
          <p className="mt-5 text-center text-[10px] text-[#1E293B]/65">
            Already have an account?{" "}

            <button
              type="button"
              onClick={() => navigate("/login")}
              disabled={loading}
              className="font-semibold text-[#0056B3] transition hover:text-[#002D62] disabled:opacity-50"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}