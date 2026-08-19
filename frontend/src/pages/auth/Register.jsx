import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [show, setShow] = useState(false);
  const [department, setDepartment] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register");
  };

  return (
    <div className="min-h-screen flex bg-[#f7f8fc]">

      {/* LEFT */}
      <div
        className="hidden md:flex w-1/2 min-h-screen bg-cover bg-center relative text-white"
        style={{ backgroundImage: "url('/kmrl-register-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#032e5f]/90" />

        <div className="relative z-10 flex flex-col justify-center w-full px-14">

          <h1 className="text-[23px] font-bold flex items-center gap-2">
            ▰ KMRL DocuSense
          </h1>

          <h2 className="text-[13px] font-semibold leading-relaxed mt-7 max-w-[310px]">
            Infrastructure Intelligence powered by precise
            <br />
            document extraction and analytics.
          </h2>

          <div className="flex gap-2 mt-8">
            <span className="px-3 py-1.5 rounded bg-white/10 border border-white/15
              text-[8px] text-blue-100">
              🟢 Secure Architecture
            </span>

            <span className="px-3 py-1.5 rounded bg-white/10 border border-white/15
              text-[8px] text-blue-100">
              ↗ High-Speed Extraction
            </span>
          </div>

        </div>
      </div>


      {/* RIGHT */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center px-6">

        <div className="w-full max-w-[292px]">

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-[18px] font-bold text-slate-900">
              Create Your Account
            </h2>

            <p className="text-[8px] text-slate-500 mt-1">
              Register for secure access to enterprise document analytics.
            </p>
          </div>


          <form onSubmit={handleSubmit}>

            {/* Name */}
            <label className="block text-[8px] font-medium text-slate-600 mb-1">
              Full Name
            </label>

            <input
              type="text"
              placeholder="John Doe"
              required
              className="w-full h-7 px-3 mb-3 border border-slate-200 rounded-md
                bg-white text-[9px] outline-none focus:border-[#073566]"
            />


            {/* Email */}
            <label className="block text-[8px] font-medium text-slate-600 mb-1">
              Work Email
            </label>

            <input
              type="email"
              placeholder="name@kmrl.co.in"
              required
              className="w-full h-7 px-3 mb-3 border border-slate-200 rounded-md
                bg-white text-[9px] outline-none focus:border-[#073566]"
            />


            {/* Department */}
            <label className="block text-[8px] font-medium text-slate-600 mb-1">
              Department
            </label>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="w-full h-7 px-3 mb-3 border border-slate-200 rounded-md
                bg-white text-[9px] text-slate-500 outline-none
                focus:border-[#073566]"
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
            <div className="grid grid-cols-2 gap-2 mb-3">

              <div>
                <label className="block text-[8px] font-medium text-slate-600 mb-1">
                  Password
                </label>

                <input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full h-7 px-3 border border-slate-200 rounded-md
                    bg-white text-[9px] outline-none focus:border-[#073566]"
                />
              </div>

              <div>
                <label className="block text-[8px] font-medium text-slate-600 mb-1">
                  Confirm Password
                </label>

                <input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full h-7 px-3 border border-slate-200 rounded-md
                    bg-white text-[9px] outline-none focus:border-[#073566]"
                />
              </div>

            </div>


            {/* Password visibility */}
            <label className="flex items-center gap-1.5 mb-4">
              <input
                type="checkbox"
                onChange={() => setShow(!show)}
                className="w-3 h-3 accent-[#073566]"
              />

              <span className="text-[8px] text-slate-500">
                Show passwords
              </span>
            </label>


            {/* Privacy */}
            <label className="flex items-start gap-1.5 mb-5">

              <input
                type="checkbox"
                required
                className="w-3 h-3 mt-[1px] accent-[#073566]"
              />

              <span className="text-[8px] leading-relaxed text-slate-500">
                I agree to the{" "}
                <span className="text-[#073566] font-medium">
                  KMRL Data Privacy Policy
                </span>{" "}
                and{" "}
                <span className="text-[#073566] font-medium">
                  Terms of Use.
                </span>
              </span>

            </label>


            {/* Register */}
            <button
              type="submit"
              className="w-full h-7 rounded-md bg-[#032d5c]
                hover:bg-[#06254a] text-white text-[9px]
                font-semibold transition"
            >
              Create Account&nbsp; →
            </button>

          </form>


          {/* Sign in */}
          <p className="text-center text-[8px] text-slate-500 mt-7">
            Already have an account?{" "}
            <button type="button" className="font-semibold text-[#073566]"
                onClick={() => navigate("/login")}>
                Sign In
            </button>
          </p>

        </div>

      </div>

    </div>
  );
}