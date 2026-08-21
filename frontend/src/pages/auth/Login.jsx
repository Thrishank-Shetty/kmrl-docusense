import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/kmrl-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-[#002D62]/75" />

      <div className="relative z-10 w-full max-w-[440px] mx-6 p-10 bg-white
        rounded-xl border border-[#E5E7EB] shadow-2xl">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
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
          <p className="text-[12px] text-[#1E293B]/65 mt-2">
            Enter your credentials to access the platform.
          </p>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          console.log("Login");
        }}>

          {/* Email */}
          <label className="block text-[11px] font-semibold text-[#1E293B] mb-2">
            Email Address
          </label>

          <input
            type="email"
            placeholder="name@kmrl.co.in"
            required
            className="w-full h-12 px-4 mb-6 border border-[#E5E7EB] rounded-lg
              bg-white text-[13px] outline-none placeholder:text-[#9CA3AF]
              focus:border-[#0056B3] focus:ring-2 focus:ring-[#0056B3]/10"
          />

          {/* Password */}
          <div className="flex justify-between mb-2">
            <label className="text-[11px] font-semibold text-[#1E293B]">
              Password
            </label>

            <button
              type="button"
              className="text-[11px] font-semibold text-[#0056B3] hover:text-[#002D62]"
            >
              Forgot?
            </button>
          </div>

          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="••••••••••"
              required
              className="w-full h-12 px-4 pr-12 mb-5 border border-[#E5E7EB]
                rounded-lg bg-white text-[13px] outline-none
                placeholder:text-[#9CA3AF] focus:border-[#0056B3]
                focus:ring-2 focus:ring-[#0056B3]/10"
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-4 top-3.5 text-[#9CA3AF]"
            >
              {show ? "◉" : "◌"}
            </button>
          </div>

          {/* Remember */}
          <label className="flex items-center gap-2 mb-7 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-[#0056B3]"
            />
            <span className="text-[11px] text-[#1E293B]/70">
              Remember me
            </span>
          </label>

          {/* Login */}
          <button
            type="submit"
            className="w-full h-12 rounded-lg bg-[#002D62] hover:bg-[#0056B3]
              text-white text-[13px] font-semibold transition shadow-sm"
          >
            Sign In →
          </button>
        </form>

        <div className="h-px bg-[#E5E7EB] my-7" />

        <p className="text-center text-[11px] text-[#1E293B]/65">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-semibold text-[#0056B3] hover:text-[#002D62]"
          >
            Request access
          </button>
        </p>

      </div>
    </div>
  );
}