import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-[#f7f8fc]">

      {/* Left */}
      <div
        className="hidden md:flex w-1/2 min-h-screen bg-cover bg-center relative text-white"
        style={{ backgroundImage: "url('/kmrl-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#032e5f]/90" />

        <div className="relative z-10 flex flex-col justify-between w-full p-14">

          <div className="flex items-center gap-3">
            <span className="text-2xl">◉</span>
            <div>
              <h1 className="text-[23px] font-bold">KMRL DocuSense</h1>
              <p className="text-[8px] text-blue-200">
                Enterprise Intelligence
              </p>
            </div>
          </div>

          <div className="max-w-[370px]">
            <h2 className="text-[22px] font-bold leading-tight mb-4">
              Infrastructure Intelligence,<br />
              Secured.
            </h2>

            <p className="text-[11px] leading-relaxed text-blue-100/85">
              Access and analyze critical operational documents with precision.
              Our enterprise-grade platform ensures data integrity and seamless
              extraction workflows for KMRL operators.
            </p>

            <span className="inline-block mt-7 px-3 py-1.5 rounded-full
              border border-white/15 bg-white/10 text-[8px] text-blue-100">
              🔒 Enterprise-grade AES-256 Encryption
            </span>
          </div>

        </div>
      </div>


      {/* Right */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6">

        <div className="w-full max-w-[320px] bg-white border border-slate-100
          rounded-lg p-6 shadow-[0_12px_35px_rgba(20,38,70,.07)]">

          <div className="mb-6">
            <h2 className="text-[13px] font-bold text-slate-700">
              Sign In to Your Account
            </h2>
            <p className="text-[8.5px] text-slate-400 mt-1">
              Enter your credentials to access the platform.
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            console.log("Login");
          }}>

            {/* Email */}
            <label className="block text-[8px] font-semibold text-slate-500 mb-1.5">
              Email Address
            </label>

            <input
              type="email"
              placeholder="name@kmrl.co.in"
              required
              className="w-full h-7 px-2 mb-4 border border-slate-200 rounded-md
                outline-none text-[9px] focus:border-[#073566]"
            />


            {/* Password */}
            <div className="flex justify-between mb-1.5">
              <label className="text-[8px] font-semibold text-slate-500">
                Password
              </label>

              <button
                type="button"
                className="text-[8px] font-semibold text-[#4b83bd]"
              >
                Forgot?
              </button>
            </div>

            <div className="relative">
              <input
                type={show ? "text" : "password"}
                placeholder="••••••••••"
                required
                className="w-full h-7 px-2 pr-8 mb-3 border border-slate-200
                  rounded-md outline-none text-[9px] focus:border-[#073566]"
              />

              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1 text-[11px] text-slate-400"
              >
                {show ? "◉" : "◌"}
              </button>
            </div>


            {/* Remember */}
            <label className="flex items-center gap-1.5 mb-5">
              <input type="checkbox" className="w-3 h-3 accent-[#073566]" />
              <span className="text-[8px] text-slate-500">
                Remember me
              </span>
            </label>


            {/* Login */}
            <button
              type="submit"
              className="w-full h-7 rounded-md bg-[#032d5c] hover:bg-[#06254a]
                text-white text-[9px] font-semibold transition"
            >
              Sign In →
            </button>

          </form>

          <div className="h-px bg-slate-100 my-5" />

          <p className="text-center text-[8px] text-slate-400">
            Don't have an account?{" "}
                <button className="font-semibold text-[#4b83bd]" onClick={() => navigate("/register")}>
                    Request access
                </button>
          </p>

        </div>
      </div>

    </div>
  );
}