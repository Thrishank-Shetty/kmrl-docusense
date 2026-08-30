import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [show, setShow] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        username: form.username.trim(),
        password: form.password,
      });

      const { access_token, token_type } = response.data;

      if (!access_token) {
        throw new Error("Authentication token was not received.");
      }

      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("access_token", access_token);
      storage.setItem("token_type", token_type || "bearer");

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);

      const message =
        err.response?.data?.detail ||
        "Unable to sign in. Please check your username and password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/kmrl-bg.jpg')" }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-[#002D62]/75" />

      {/* Login card */}
      <div className="relative z-10 mx-6 w-full max-w-[440px] rounded-xl border border-[#E5E7EB] bg-white p-10 shadow-2xl">

        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="text-3xl text-[#002D62]">◉</span>

          <div>
            <h1 className="text-[24px] font-bold text-[#002D62]">
              KMRL DocuSense
            </h1>

            <p className="text-[10px] text-[#1E293B]/60">
              Enterprise Intelligence
            </p>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h2 className="text-[22px] font-bold text-[#111827]">
            Sign In to Your Account
          </h2>

          <p className="mt-2 text-[12px] text-[#1E293B]/65">
            Enter your credentials to access the platform.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-[11px] font-medium leading-relaxed text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Username */}
          <label className="mb-2 block text-[11px] font-semibold text-[#1E293B]">
            Username
          </label>

          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter your username"
            autoComplete="username"
            required
            disabled={loading}
            className="mb-6 h-12 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#0056B3] focus:ring-2 focus:ring-[#0056B3]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          {/* Password label */}
          <div className="mb-2 flex justify-between">
            <label className="text-[11px] font-semibold text-[#1E293B]">
              Password
            </label>

            <button
              type="button"
              disabled={loading}
              className="text-[11px] font-semibold text-[#0056B3] transition hover:text-[#002D62] disabled:opacity-50"
            >
              Forgot?
            </button>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
              className="mb-5 h-12 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 pr-12 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#0056B3] focus:ring-2 focus:ring-[#0056B3]/10 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <button
              type="button"
              onClick={() => setShow((prev) => !prev)}
              disabled={loading}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-4 top-3.5 text-[#9CA3AF] transition hover:text-[#0056B3] disabled:opacity-50"
            >
              {show ? "◉" : "◌"}
            </button>
          </div>

          {/* Remember me */}
          <label className="mb-7 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 accent-[#0056B3]"
            />

            <span className="text-[11px] text-[#1E293B]/70">
              Remember me
            </span>
          </label>

          {/* Login */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[#002D62] text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#0056B3] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing In..." : "Sign In →"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-7 h-px bg-[#E5E7EB]" />

        {/* Register */}
        <p className="text-center text-[11px] text-[#1E293B]/65">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-semibold text-[#0056B3] transition hover:text-[#002D62]"
          >
            Request access
          </button>
        </p>
      </div>
    </div>
  );
}