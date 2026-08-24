import { useState } from "react";

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");

  const [profile, setProfile] = useState({
    employeeId: "KMRL-ADM-001",
    name: "Administrator",
    email: "administrator@kmrl.com",
    department: "Operations",
    role: "Administrator",
    photo: null,
  });

  const [profileDraft, setProfileDraft] = useState(profile);
  const [editProfile, setEditProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
  });
  const [securityMessage, setSecurityMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [notifications, setNotifications] = useState({
    documentProcessing: true,
    complianceAlerts: true,
    reviewRequired: true,
    systemUpdates: false,
  });

  const [systemConfig, setSystemConfig] = useState({
    confidenceThreshold: 75,
    autoArchiveDays: 90,
  });

  const handleProfileChange = (field, value) => {
    setProfileDraft((current) => ({ ...current, [field]: value }));
    setProfileError("");
  };

  const handleEditProfile = () => {
    setProfileDraft(profile);
    setProfileError("");
    setEditProfile(true);
  };

  const handleCancelEdit = () => {
    setProfileDraft(profile);
    setProfileError("");
    setEditProfile(false);
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Profile photo must be smaller than 5 MB.");
      return;
    }

    setProfileDraft((current) => ({
      ...current,
      photo: URL.createObjectURL(file),
    }));
    setProfileError("");
  };

  const handleSaveProfile = () => {
    const { employeeId, name, email, department, role } = profileDraft;

    if (
      !employeeId.trim() ||
      !name.trim() ||
      !email.trim() ||
      !department.trim() ||
      !role.trim()
    ) {
      setProfileError("All profile fields are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    setProfile({
      ...profileDraft,
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      role: role.trim(),
    });

    setEditProfile(false);
    setProfileError("");
  };

  const handleSecurityChange = (field, value) => {
    setSecurity((current) => ({ ...current, [field]: value }));
    setSecurityMessage("");
  };

  const handlePasswordUpdate = () => {
    const { currentPassword, newPassword, confirmPassword } = security;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityMessage("Please complete all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityMessage("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setSecurityMessage(
        "New password must contain at least 8 characters."
      );
      return;
    }

    setSecurityMessage(
      "Password update ready for backend integration."
    );

    setSecurity({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      twoFactor: security.twoFactor,
    });
  };

  const handleTwoFactorToggle = () => {
    const value = !security.twoFactor;

    setSecurity((current) => ({
      ...current,
      twoFactor: value,
    }));

    setOtpSent(false);
    setOtp("");
    setSecurityMessage("");
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    setSecurityMessage("");
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setSecurityMessage(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    setSecurityMessage(
      "OTP verification ready for backend integration."
    );
  };

  const handleNotificationChange = (field) => {
    setNotifications((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleSystemChange = (field, value) => {
    setSystemConfig((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const navButton = (section) =>
    `w-full rounded-lg px-5 py-4 text-left text-[15px] font-bold transition-all duration-200 ${
      activeSection === section
        ? "bg-[#0E4B9E] text-white shadow-sm"
        : "text-[#334155] hover:bg-[#E5EFF9] hover:text-[#0E4B9E]"
    }`;

  const toggleClass = (enabled) =>
    `relative flex h-[28px] w-[50px] shrink-0 rounded-full transition-all ${
      enabled ? "bg-[#0E4B9E]" : "bg-[#CBD5E1]"
    }`;

  const toggleCircle = (enabled) =>
    `absolute left-[4px] top-[4px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-transform ${
      enabled ? "translate-x-[22px]" : ""
    }`;

  const inputClass =
    "h-11 w-full rounded-lg border border-[#D7DEE8] bg-white px-3 text-[15px] font-semibold text-[#111827] outline-none focus:border-[#0E4B9E] focus:ring-2 focus:ring-[#DCEBFA] disabled:bg-[#F8FAFC] disabled:text-[#475569]";

  const notificationItems = [
    [
      "documentProcessing",
      "Document Processing",
      "Get notified when document processing is complete.",
    ],
    [
      "complianceAlerts",
      "Compliance Alerts",
      "Receive alerts when critical compliance issues are detected.",
    ],
    [
      "reviewRequired",
      "Review Required",
      "Get notified when a document requires manual review.",
    ],
    [
      "systemUpdates",
      "System Updates",
      "Receive notifications about system updates and maintenance.",
    ],
  ];

  return (
    <div className="min-h-screen bg-[#DCEBFA] px-8 py-5">
      <h1 className="mb-5 text-[32px] font-bold leading-tight text-[#111827]">
        Settings
      </h1>

      <div className="grid grid-cols-[250px_1fr] items-start gap-6">
        {/* SIDEBAR */}
        <div className="rounded-xl border border-[#DCE5EF] bg-white p-3 shadow-sm">
          {[
            ["profile", "User Profile"],
            ["security", "Account Security"],
            ["notifications", "Notifications"],
            ["system", "System Configuration"],
          ].map(([section, label], i) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className={`${navButton(section)} ${i ? "mt-1" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="rounded-xl border border-[#DCE5EF] bg-white p-8 shadow-sm">

          {/* PROFILE */}
          {activeSection === "profile" && (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[25px] font-bold text-[#111827]">
                    User Profile
                  </h2>
                  <p className="mt-2 text-[14px] font-medium text-[#64748B]">
                    View and manage your account information.
                  </p>
                </div>

                {!editProfile && (
                  <button
                    onClick={handleEditProfile}
                    className="h-11 rounded-lg bg-[#0E4B9E] px-6 text-[14px] font-bold text-white hover:bg-[#063B82]"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="mt-8 flex items-center gap-5 border-b border-[#E5E7EB] pb-9">
                <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border-2 border-[#DCEBFA] bg-[#DCEBFA]">
                  {profileDraft.photo ? (
                    <img
                      src={profileDraft.photo}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[30px] font-bold text-[#063372]">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-[21px] font-bold text-[#111827]">
                    {profile.name}
                  </h3>

                  <p className="mt-2 text-[14px] font-medium text-[#64748B]">
                    Employee ID:{" "}
                    <span className="font-semibold text-[#475569]">
                      {profile.employeeId}
                    </span>
                  </p>

                  {editProfile && (
                    <label className="mt-4 inline-block cursor-pointer">
                      <span className="inline-flex h-10 items-center rounded-lg bg-[#063B82] px-5 text-[13px] font-bold text-white hover:bg-[#052E68]">
                        Change Profile Photo
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {profileError && (
                <div className="mt-5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
                  {profileError}
                </div>
              )}

              <div className="mt-8 grid grid-cols-2 gap-x-7 gap-y-7">
                {[
                  ["employeeId", "Employee ID", "text"],
                  ["name", "Full Name", "text"],
                  ["email", "Email Address", "email"],
                  ["department", "Department", "text"],
                  ["role", "Role", "text"],
                ].map(([field, label, type]) => (
                  <div key={field}>
                    <label className="mb-2 block text-[15px] font-bold text-[#334155]">
                      {label}
                    </label>

                    <input
                      type={type}
                      value={
                        editProfile
                          ? profileDraft[field]
                          : profile[field]
                      }
                      disabled={!editProfile}
                      onChange={(e) =>
                        handleProfileChange(field, e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              {editProfile && (
                <div className="mt-9 flex justify-end gap-3">
                  <button
                    onClick={handleCancelEdit}
                    className="h-11 rounded-lg border border-[#CBD5E1] px-6 text-[14px] font-bold text-[#475260] hover:bg-[#F8FAFC]"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveProfile}
                    className="h-11 rounded-lg bg-[#0E4B9E] px-7 text-[14px] font-bold text-white hover:bg-[#063B82]"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <div>
              <h2 className="text-[25px] font-bold text-[#111827]">
                Account Security
              </h2>

              <p className="mt-2 text-[14px] font-medium text-[#64748B]">
                Manage password protection and account security.
              </p>

              {/* PASSWORD */}
              <div className="mt-8 overflow-hidden rounded-xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() =>
                    setChangePasswordOpen(!changePasswordOpen)
                  }
                  className="flex w-full items-center justify-between px-5 py-5 text-left hover:bg-[#F8FAFC]"
                >
                  <div>
                    <p className="text-[17px] font-bold text-[#111827]">
                      Change Password
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#64748B]">
                      Update your account password.
                    </p>
                  </div>

                  <span className="text-[22px] text-[#334155]">
                    {changePasswordOpen ? "−" : "+"}
                  </span>
                </button>

                {changePasswordOpen && (
                  <div className="space-y-5 border-t border-[#E5E7EB] px-5 pb-6 pt-6">
                    {[
                      ["currentPassword", "Current Password"],
                      ["newPassword", "New Password"],
                      ["confirmPassword", "Confirm New Password"],
                    ].map(([field, label]) => (
                      <div key={field}>
                        <label className="mb-2 block text-[15px] font-bold text-[#334155]">
                          {label}
                        </label>

                        <input
                          type="password"
                          value={security[field]}
                          onChange={(e) =>
                            handleSecurityChange(
                              field,
                              e.target.value
                            )
                          }
                          placeholder={label}
                          className={inputClass}
                        />
                      </div>
                    ))}

                    <button
                      onClick={handlePasswordUpdate}
                      className="h-11 rounded-lg bg-[#0E4B9E] px-6 text-[14px] font-bold text-white hover:bg-[#063B82]"
                    >
                      Update Password
                    </button>

                    {securityMessage && (
                      <p className="text-[13px] font-semibold text-[#475260]">
                        {securityMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 2FA */}
              <div className="mt-6 rounded-xl border border-[#E2E8F0] p-5">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#111827]">
                      Two-Factor Authentication
                    </h3>

                    <p className="mt-1 text-[13px] font-semibold text-[#64748B]">
                      Receive a verification code by email when signing in.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-pressed={security.twoFactor}
                    onClick={handleTwoFactorToggle}
                    className={toggleClass(security.twoFactor)}
                  >
                    <span
                      className={toggleCircle(security.twoFactor)}
                    />
                  </button>
                </div>

                {security.twoFactor && (
                  <div className="mt-5 border-t border-[#E5E7EB] pt-5">
                    <p className="text-[13px] font-semibold text-[#475260]">
                      Verification codes will be sent to:
                    </p>

                    <p className="mt-1 text-[14px] font-bold text-[#111827]">
                      {profile.email}
                    </p>

                    {!otpSent ? (
                      <button
                        onClick={handleSendOtp}
                        className="mt-4 h-10 rounded-lg bg-[#0E4B9E] px-5 text-[13px] font-bold text-white hover:bg-[#063B82]"
                      >
                        Send Verification Code
                      </button>
                    ) : (
                      <div className="mt-5">
                        <label className="mb-2 block text-[15px] font-bold text-[#334155]">
                          Enter 6-Digit Code
                        </label>

                        <div className="flex gap-3">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) =>
                              setOtp(
                                e.target.value.replace(/\D/g, "")
                              )
                            }
                            placeholder="000000"
                            className="h-11 w-40 rounded-lg border border-[#D7DEE8] px-3 text-center text-[14px] font-semibold tracking-[0.3em] outline-none focus:border-[#0E4B9E]"
                          />

                          <button
                            onClick={handleVerifyOtp}
                            className="h-11 rounded-lg bg-[#0E4B9E] px-6 text-[13px] font-bold text-white hover:bg-[#063B82]"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* LAST LOGIN */}
              <div className="mt-6 rounded-xl border border-[#E2E8F0] p-5">
                <h3 className="text-[17px] font-bold text-[#111827]">
                  Last Login Activity
                </h3>

                <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[17px] font-bold text-[#111827]">
                        Current Session
                      </p>

                      <p className="mt-1 text-[13px] font-semibold text-[#64748B]">
                        Chrome on Windows
                      </p>
                    </div>

                    <span className="text-[14px] font-bold text-[#15803D]">
                      Active
                    </span>
                  </div>

                  <p className="mt-4 text-[13px] font-semibold text-[#64748B]">
                    Last login: Today at 2:14 PM
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div>
              <h2 className="text-[25px] font-bold text-[#111827]">
                Notifications
              </h2>

              <p className="mt-2 text-[14px] font-medium text-[#64748B]">
                Choose which system events you want to be notified about.
              </p>

              <div className="mt-8 divide-y divide-[#E5E7EB]">
                {notificationItems.map(([field, title, description]) => (
                  <div
                    key={field}
                    className="flex items-center justify-between gap-8 py-6"
                  >
                    <div>
                      <p className="text-[17px] font-bold text-[#111827]">
                        {title}
                      </p>

                      <p className="mt-1 text-[13px] font-semibold text-[#64748B]">
                        {description}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-pressed={notifications[field]}
                      onClick={() =>
                        handleNotificationChange(field)
                      }
                      className={toggleClass(notifications[field])}
                    >
                      <span
                        className={toggleCircle(
                          notifications[field]
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SYSTEM */}
          {activeSection === "system" && (
            <div>
              <h2 className="text-[25px] font-bold text-[#111827]">
                System Configuration
              </h2>

              <p className="mt-2 text-[14px] font-medium text-[#64748B]">
                Configure document processing and storage behavior.
              </p>

              <div className="mt-8 space-y-6">
                {/* CONFIDENCE */}
                <div className="rounded-xl border border-[#E2E8F0] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[17px] font-bold text-[#111827]">
                        Confidence Threshold
                      </p>

                      <p className="mt-1 text-[13px] font-semibold text-[#64748B]">
                        Documents below this confidence level are flagged for review.
                      </p>
                    </div>

                    <span className="text-[22px] font-bold text-[#0E4B9E]">
                      {systemConfig.confidenceThreshold}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={systemConfig.confidenceThreshold}
                    onChange={(e) =>
                      handleSystemChange(
                        "confidenceThreshold",
                        Number(e.target.value)
                      )
                    }
                    className="mt-6 w-full accent-[#0E4B9E]"
                  />

                  <div className="mt-2 flex justify-between text-[13px] font-semibold text-[#64748B]">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* AUTO ARCHIVE */}
                <div className="rounded-xl border border-[#E2E8F0] p-5">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <p className="text-[17px] font-bold text-[#111827]">
                        Auto Archive
                      </p>

                      <p className="mt-1 text-[13px] font-semibold text-[#64748B]">
                        Automatically archive documents after the selected period.
                      </p>
                    </div>

                    <select
                      value={systemConfig.autoArchiveDays}
                      onChange={(e) =>
                        handleSystemChange(
                          "autoArchiveDays",
                          e.target.value === "never"
                            ? "never"
                            : Number(e.target.value)
                        )
                      }
                      className="h-11 min-w-[150px] rounded-lg border border-[#D7DEE8] bg-white px-3 text-[14px] font-semibold text-[#111827] outline-none focus:border-[#0E4B9E] focus:ring-2 focus:ring-[#DCEBFA]"
                    >
                      <option value="never">Never</option>
                      {[3, 7, 15, 30, 60, 90, 180].map((days) => (
                        <option key={days} value={days}>
                          {days} days
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* STORAGE */}
                <div className="rounded-xl border border-[#E2E8F0] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[17px] font-bold text-[#111827]">
                        Storage Usage
                      </p>

                      <p className="mt-1 text-[13px] font-semibold text-[#64748B]">
                        Current document storage consumption.
                      </p>
                    </div>

                    <span className="text-[16px] font-bold text-[#111827]">
                      6.8 GB / 10 GB
                    </span>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div
                      className="h-full rounded-full bg-[#0E4B9E]"
                      style={{ width: "68%" }}
                    />
                  </div>

                  <p className="mt-3 text-[13px] font-semibold text-[#475569]">
                    68% of available storage used
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}