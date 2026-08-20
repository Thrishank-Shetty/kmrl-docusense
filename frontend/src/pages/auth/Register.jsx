import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [show, setShow] = useState(false);
  const [department, setDepartment] = useState("");
  const navigate = useNavigate();

  return (
    <div className="h-screen flex bg-[#F3F4F6] overflow-hidden">

      {/* Left */}
      <div
        className="hidden md:flex w-1/2 h-screen bg-cover bg-center relative text-white"
        style={{ backgroundImage: "url('/kmrl-register-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#002D62]/85" />

        <div className="relative z-10 flex flex-col justify-center w-full px-16">

          <h1 className="text-[30px] font-bold flex items-center gap-3">
            ▰ KMRL DocuSense
          </h1>

          <h2 className="text-[19px] font-semibold leading-relaxed mt-8 max-w-[500px]">
            Infrastructure Intelligence powered by precise
            <br />
            document extraction and analytics.
          </h2>

          <div className="flex gap-3 mt-8">

            <span className="px-4 py-2 rounded-lg bg-white/10 border border-white/15
              text-[10px]">
              <span className="text-[#10B981]">●</span> Secure Architecture
            </span>

            <span className="px-4 py-2 rounded-lg bg-white/10 border border-white/15
              text-[10px]">
              ↗ High-Speed Extraction
            </span>

          </div>
        </div>
      </div>


      {/* Right */}
      <div className="w-full md:w-1/2 h-screen flex items-center justify-center px-10">

        <div className="w-full max-w-[460px]">

          {/* Heading */}
          <div className="mb-5">
            <h2 className="text-[22px] font-bold text-[#111827]">
              Create Your Account
            </h2>

            <p className="text-[11px] text-[#1E293B]/65 mt-1">
              Register for secure access to enterprise document analytics.
            </p>
          </div>


          <form onSubmit={(e) => {
            e.preventDefault();
            console.log("Register");
          }}>

            {/* Name */}
            <label className="block text-[10px] font-semibold text-[#1E293B] mb-1">
              Full Name
            </label>

            <input
              type="text"
              placeholder="John Doe"
              required
              className="w-full h-10 px-4 mb-3 border border-[#E5E7EB] rounded-lg
                bg-white text-[12px] text-[#111827] outline-none
                placeholder:text-[#9CA3AF] focus:border-[#0056B3]
                focus:ring-2 focus:ring-[#0056B3]/10"
            />


            {/* Email */}
            <label className="block text-[10px] font-semibold text-[#1E293B] mb-1">
              Work Email
            </label>

            <input
              type="email"
              placeholder="name@kmrl.co.in"
              required
              className="w-full h-10 px-4 mb-3 border border-[#E5E7EB] rounded-lg
                bg-white text-[12px] text-[#111827] outline-none
                placeholder:text-[#9CA3AF] focus:border-[#0056B3]
                focus:ring-2 focus:ring-[#0056B3]/10"
            />


            {/* Department */}
            <label className="block text-[10px] font-semibold text-[#1E293B] mb-1">
              Department
            </label>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="w-full h-10 px-4 mb-3 border border-[#E5E7EB] rounded-lg
                bg-white text-[12px] text-[#1E293B] outline-none
                focus:border-[#0056B3] focus:ring-2 focus:ring-[#0056B3]/10"
            >
              <option value="">Select your department</option>
              <option>Operations</option>
              <option>Engineering</option>
              <option>Finance</option>
              <option>Human Resources</option>
              <option>IT</option>
              <option>Administration</option>
            </select>


            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4 mb-3">

              <div>
                <label className="block text-[10px] font-semibold text-[#1E293B] mb-1">
                  Password
                </label>

                <input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full h-10 px-4 border border-[#E5E7EB] rounded-lg
                    bg-white text-[12px] text-[#111827] outline-none
                    placeholder:text-[#9CA3AF] focus:border-[#0056B3]
                    focus:ring-2 focus:ring-[#0056B3]/10"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#1E293B] mb-1">
                  Confirm Password
                </label>

                <input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full h-10 px-4 border border-[#E5E7EB] rounded-lg
                    bg-white text-[12px] text-[#111827] outline-none
                    placeholder:text-[#9CA3AF] focus:border-[#0056B3]
                    focus:ring-2 focus:ring-[#0056B3]/10"
                />
              </div>

            </div>


            {/* Show Password */}
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                onChange={() => setShow(!show)}
                className="w-3.5 h-3.5 accent-[#0056B3]"
              />

              <span className="text-[10px] text-[#1E293B]/70">
                Show passwords
              </span>
            </label>


            {/* Privacy */}
            <label className="flex items-start gap-2 mb-4 cursor-pointer">

              <input
                type="checkbox"
                required
                className="w-3.5 h-3.5 mt-0.5 accent-[#0056B3]"
              />

              <span className="text-[10px] leading-relaxed text-[#1E293B]/70">
                I agree to the{" "}
                <span className="text-[#0056B3] font-medium">
                  KMRL Data Privacy Policy
                </span>{" "}
                and{" "}
                <span className="text-[#0056B3] font-medium">
                  Terms of Use.
                </span>
              </span>

            </label>


            {/* Register */}
            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-[#002D62] hover:bg-[#0056B3]
                text-white text-[12px] font-semibold transition shadow-sm"
            >
              Create Account →
            </button>

          </form>


          {/* Sign In */}
          <p className="text-center text-[10px] text-[#1E293B]/65 mt-5">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-semibold text-[#0056B3] hover:text-[#002D62]"
            >
              Sign In
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}