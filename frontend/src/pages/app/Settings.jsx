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
    setProfileDraft((current) => ({
      ...current,
      [field]: value,
    }));

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

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Profile photo must be smaller than 5 MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setProfileDraft((current) => ({
      ...current,
      photo: imageUrl,
    }));

    setProfileError("");
  };

  const handleSaveProfile = () => {
    const {
      employeeId,
      name,
      email,
      department,
      role,
    } = profileDraft;

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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    setProfile({
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      role: role.trim(),
      photo: profileDraft.photo,
    });

    setEditProfile(false);
    setProfileError("");
  };

  const handleSecurityChange = (field, value) => {
    setSecurity((current) => ({
      ...current,
      [field]: value,
    }));

    setSecurityMessage("");
  };

  const handlePasswordUpdate = () => {
    if (
      !security.currentPassword ||
      !security.newPassword ||
      !security.confirmPassword
    ) {
      setSecurityMessage("Please complete all password fields.");
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      setSecurityMessage("New passwords do not match.");
      return;
    }

    if (security.newPassword.length < 8) {
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
    const newValue = !security.twoFactor;

    setSecurity((current) => ({
      ...current,
      twoFactor: newValue,
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

  const navButtonClass = (section) =>
    `w-full text-left px-5 py-4 rounded-lg transition-all duration-200 text-[15px] font-bold ${
      activeSection === section
        ? "bg-[#0E4B9E] text-white shadow-sm"
        : "text-[#334155] hover:bg-[#E5EFF9] hover:text-[#0E4B9E]"
    }`;

  const toggleClass = (enabled) =>
    `relative w-[50px] h-[28px] rounded-full transition-all duration-200 flex-shrink-0 ${
      enabled ? "bg-[#0E4B9E]" : "bg-[#CBD5E1]"
    }`;

  const toggleCircleClass = (enabled) =>
    `absolute top-[4px] left-[4px] w-[20px] h-[20px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
      enabled ? "translate-x-[22px]" : "translate-x-0"
    }`;

  const inputClass =
    "w-full h-11 px-3 rounded-lg border border-[#D7DEE8] bg-white text-[15px] font-semibold text-[#111827] outline-none focus:border-[#0E4B9E] focus:ring-2 focus:ring-[#DCEBFA] disabled:bg-[#F8FAFC] disabled:text-[#475569]";

  return (
    <div className="min-h-screen bg-[#DCEBFA] px-8 py-5">
      <div className="mb-5">
        <h1 className="text-[32px] leading-tight font-bold text-[#111827]">
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-[250px_1fr] gap-6 items-start">
        <div className="bg-white border border-[#DCE5EF] rounded-xl p-3 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveSection("profile")}
            className={navButtonClass("profile")}
          >
            User Profile
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("security")}
            className={`mt-1 ${navButtonClass("security")}`}
          >
            Account Security
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("notifications")}
            className={`mt-1 ${navButtonClass("notifications")}`}
          >
            Notifications
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("system")}
            className={`mt-1 ${navButtonClass("system")}`}
          >
            System Configuration
          </button>
        </div>

        <div className="bg-white border border-[#DCE5EF] rounded-xl shadow-sm p-8">
          {activeSection === "profile" && (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[25px] leading-tight font-bold text-[#111827]">
                    User Profile
                  </h2>

                  <p className="mt-2 text-[14px] font-medium text-[#64748B]">
                    View and manage your account information.
                  </p>
                </div>

                {!editProfile && (
                  <button
                    type="button"
                    onClick={handleEditProfile}
                    className="h-11 px-6 rounded-lg bg-[#0E4B9E] text-white text-[14px] font-bold hover:bg-[#063B82] transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="mt-8 flex items-center gap-5 pb-9 border-b border-[#E5E7EB]">
                <div className="w-[88px] h-[88px] rounded-full overflow-hidden border-2 border-[#DCEBFA] bg-[#DCEBFA] flex items-center justify-center">
                  {profileDraft.photo ? (
                    <img
                      src={profileDraft.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[#063372] text-[30px] font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-[21px] font-bold text-[#111827]">
                    {profile.name}
                  </h3>

                  <p className="text-[14px] font-medium text-[#64748B] mt-2">
                    Employee ID:{" "}
                    <span className="font-semibold text-[#475569]">
                      {profile.employeeId}
                    </span>
                  </p>

                  {editProfile && (
                    <label className="inline-block mt-4 cursor-pointer">
                      <span className="inline-flex items-center h-10 px-5 rounded-lg bg-[#063B82] text-white text-[13px] font-bold hover:bg-[#052E68] transition-colors">
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
                <div className="mt-5 px-4 py-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[13px] font-medium text-[#B91C1C]">
                  {profileError}
                </div>
              )}

              <div className="mt-8 grid grid-cols-2 gap-x-7 gap-y-7">
                <div>
                  <label className="block text-[15px] font-bold text-[#334155] mb-2">
                    Employee ID
                  </label>

                  <input
                    type="text"
                    value={
                      editProfile
                        ? profileDraft.employeeId
                        : profile.employeeId
                    }
                    disabled={!editProfile}
                    onChange={(event) =>
                      handleProfileChange(
                        "employeeId",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-bold text-[#334155] mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={
                      editProfile
                        ? profileDraft.name
                        : profile.name
                    }
                    disabled={!editProfile}
                    onChange={(event) =>
                      handleProfileChange(
                        "name",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-bold text-[#334155] mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={
                      editProfile
                        ? profileDraft.email
                        : profile.email
                    }
                    disabled={!editProfile}
                    onChange={(event) =>
                      handleProfileChange(
                        "email",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-bold text-[#334155] mb-2">
                    Department
                  </label>

                  <input
                    type="text"
                    value={
                      editProfile
                        ? profileDraft.department
                        : profile.department
                    }
                    disabled={!editProfile}
                    onChange={(event) =>
                      handleProfileChange(
                        "department",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[15px] font-bold text-[#334155] mb-2">
                    Role
                  </label>

                  <input
                    type="text"
                    value={
                      editProfile
                        ? profileDraft.role
                        : profile.role
                    }
                    disabled={!editProfile}
                    onChange={(event) =>
                      handleProfileChange(
                        "role",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {editProfile && (
                <div className="mt-9 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="h-11 px-6 rounded-lg border border-[#CBD5E1] text-[#475260] text-[14px] font-bold hover:bg-[#F8FAFC] transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="h-11 px-7 rounded-lg bg-[#0E4B9E] text-white text-[14px] font-bold hover:bg-[#063B82] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "security" && (
            <div>
              <h2 className="text-[25px] leading-tight font-bold text-[#111827]">
                Account Security
              </h2>

              <p className="mt-2 text-[14px] font-medium text-[#64748B]">
                Manage password protection and account security.
              </p>

              <div className="mt-8 border border-[#E2E8F0] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setChangePasswordOpen(
                      !changePasswordOpen
                    )
                  }
                  className="w-full flex items-center justify-between px-5 py-5 text-left hover:bg-[#F8FAFC] transition-colors"
                >
                  <div>
                    <p className="text-[17px] font-bold text-[#111827]">
                      Change Password
                    </p>

                    <p className="text-[13px] font-semibold text-[#64748B] mt-1">
                      Update your account password.
                    </p>
                  </div>

                  <span className="text-[#334155] text-[22px] font-medium">
                    {changePasswordOpen ? "−" : "+"}
                  </span>
                </button>

                {changePasswordOpen && (
                  <div className="px-5 pb-6 border-t border-[#E5E7EB] pt-6 space-y-5">
                    <div>
                      <label className="block text-[15px] font-bold text-[#334155] mb-2">
                        Current Password
                      </label>

                      <input
                        type="password"
                        value={security.currentPassword}
                        onChange={(event) =>
                          handleSecurityChange(
                            "currentPassword",
                            event.target.value
                          )
                        }
                        placeholder="Enter current password"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-[15px] font-bold text-[#334155] mb-2">
                        New Password
                      </label>

                      <input
                        type="password"
                        value={security.newPassword}
                        onChange={(event) =>
                          handleSecurityChange(
                            "newPassword",
                            event.target.value
                          )
                        }
                        placeholder="Enter new password"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-[15px] font-bold text-[#334155] mb-2">
                        Confirm New Password
                      </label>

                      <input
                        type="password"
                        value={security.confirmPassword}
                        onChange={(event) =>
                          handleSecurityChange(
                            "confirmPassword",
                            event.target.value
                          )
                        }
                        placeholder="Confirm new password"
                        className={inputClass}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handlePasswordUpdate}
                      className="h-11 px-6 rounded-lg bg-[#0E4B9E] text-white text-[14px] font-bold hover:bg-[#063B82] transition-colors"
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

              <div className="mt-6 border border-[#E2E8F0] rounded-xl p-5">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#111827]">
                      Two-Factor Authentication
                    </h3>

                    <p className="text-[13px] font-semibold text-[#64748B] mt-1">
                      Receive a verification code by email when signing in.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Toggle two-factor authentication"
                    aria-pressed={security.twoFactor}
                    onClick={handleTwoFactorToggle}
                    className={toggleClass(
                      security.twoFactor
                    )}
                  >
                    <span
                      className={toggleCircleClass(
                        security.twoFactor
                      )}
                    />
                  </button>
                </div>

                {security.twoFactor && (
                  <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
                    <p className="text-[13px] font-semibold text-[#475260]">
                      Verification codes will be sent to:
                    </p>

                    <p className="text-[14px] font-bold text-[#111827] mt-1">
                      {profile.email}
                    </p>

                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="mt-4 h-10 px-5 rounded-lg bg-[#0E4B9E] text-white text-[13px] font-bold hover:bg-[#063B82]"
                      >
                        Send Verification Code
                      </button>
                    ) : (
                      <div className="mt-5">
                        <label className="block text-[15px] font-bold text-[#334155] mb-2">
                          Enter 6-Digit Code
                        </label>

                        <div className="flex gap-3">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(event) =>
                              setOtp(
                                event.target.value.replace(
                                  /\D/g,
                                  ""
                                )
                              )
                            }
                            placeholder="000000"
                            className="h-11 w-40 px-3 rounded-lg border border-[#D7DEE8] text-[14px] font-semibold tracking-[0.3em] text-center outline-none focus:border-[#0E4B9E]"
                          />

                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="h-11 px-6 rounded-lg bg-[#0E4B9E] text-white text-[13px] font-bold hover:bg-[#063B82]"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 border border-[#E2E8F0] rounded-xl p-5">
                <h3 className="text-[17px] font-bold text-[#111827]">
                  Last Login Activity
                </h3>

                <div className="mt-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[17px] font-bold text-[#111827]">
                        Current Session
                      </p>

                      <p className="text-[13px] font-semibold text-[#64748B] mt-1">
                        Chrome on Windows
                      </p>
                    </div>

                    <span className="text-[14px] font-bold text-[#15803D]">
                      Active
                    </span>
                  </div>

                  <div className="mt-4 text-[13px] font-semibold text-[#64748B]">
                    Last login: Today at 2:14 PM
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div>
              <h2 className="text-[25px] leading-tight font-bold text-[#111827]">
                Notifications
              </h2>

              <p className="mt-2 text-[14px] font-medium text-[#64748B]">
                Choose which system events you want to be notified about.
              </p>

              <div className="mt-8 divide-y divide-[#E5E7EB]">
                <div className="py-6 flex items-center justify-between gap-8">
                  <div>
                    <p className="text-[17px] font-bold text-[#111827]">
                      Document Processing
                    </p>

                    <p className="text-[13px] font-semibold text-[#64748B] mt-1">
                      Get notified when document processing is complete.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Toggle document processing notifications"
                    aria-pressed={notifications.documentProcessing}
                    onClick={() =>
                      handleNotificationChange(
                        "documentProcessing"
                      )
                    }
                    className={toggleClass(
                      notifications.documentProcessing
                    )}
                  >
                    <span
                      className={toggleCircleClass(
                        notifications.documentProcessing
                      )}
                    />
                  </button>
                </div>

                <div className="py-6 flex items-center justify-between gap-8">
                  <div>
                    <p className="text-[17px] font-bold text-[#111827]">
                      Compliance Alerts
                    </p>

                    <p className="text-[13px] font-semibold text-[#64748B] mt-1">
                      Receive alerts when critical compliance issues are detected.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Toggle compliance alerts"
                    aria-pressed={notifications.complianceAlerts}
                    onClick={() =>
                      handleNotificationChange(
                        "complianceAlerts"
                      )
                    }
                    className={toggleClass(
                      notifications.complianceAlerts
                    )}
                  >
                    <span
                      className={toggleCircleClass(
                        notifications.complianceAlerts
                      )}
                    />
                  </button>
                </div>

                <div className="py-6 flex items-center justify-between gap-8">
                  <div>
                    <p className="text-[17px] font-bold text-[#111827]">
                      Review Required
                    </p>

                    <p className="text-[13px] font-semibold text-[#64748B] mt-1">
                      Get notified when a document requires manual review.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Toggle review required notifications"
                    aria-pressed={notifications.reviewRequired}
                    onClick={() =>
                      handleNotificationChange(
                        "reviewRequired"
                      )
                    }
                    className={toggleClass(
                      notifications.reviewRequired
                    )}
                  >
                    <span
                      className={toggleCircleClass(
                        notifications.reviewRequired
                      )}
                    />
                  </button>
                </div>

                <div className="py-6 flex items-center justify-between gap-8">
                  <div>
                    <p className="text-[17px] font-bold text-[#111827]">
                      System Updates
                    </p>

                    <p className="text-[13px] font-semibold text-[#64748B] mt-1">
                      Receive notifications about system updates and maintenance.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Toggle system update notifications"
                    aria-pressed={notifications.systemUpdates}
                    onClick={() =>
                      handleNotificationChange(
                        "systemUpdates"
                      )
                    }
                    className={toggleClass(
                      notifications.systemUpdates
                    )}
                  >
                    <span
                      className={toggleCircleClass(
                        notifications.systemUpdates
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "system" && (
            <div>
              <h2 className="text-[25px] leading-tight font-bold text-[#111827]">
                System Configuration
              </h2>

              <p className="mt-2 text-[14px] font-medium text-[#64748B]">
                Configure document processing and storage behavior.
              </p>

              <div className="mt-8 space-y-6">
                <div className="p-5 border border-[#E2E8F0] rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[17px] font-bold text-[#111827]">
                        Confidence Threshold
                      </p>

                      <p className="text-[13px] font-semibold text-[#64748B] mt-1">
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
                    onChange={(event) =>
                      handleSystemChange(
                        "confidenceThreshold",
                        Number(event.target.value)
                      )
                    }
                    className="w-full mt-6 accent-[#0E4B9E]"
                  />

                  <div className="flex justify-between mt-2 text-[13px] font-semibold text-[#64748B]">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="p-5 border border-[#E2E8F0] rounded-xl">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <p className="text-[17px] font-bold text-[#111827]">
                        Auto Archive
                      </p>

                      <p className="text-[13px] font-semibold text-[#64748B] mt-1">
                        Automatically archive documents after the selected period.
                      </p>
                    </div>

                    <select
                      value={systemConfig.autoArchiveDays}
                      onChange={(event) =>
                        handleSystemChange(
                          "autoArchiveDays",
                          event.target.value === "never"
                            ? "never"
                            : Number(event.target.value)
                        )
                      }
                      className="h-11 px-3 min-w-[150px] rounded-lg border border-[#D7DEE8] bg-white text-[14px] font-semibold text-[#111827] outline-none focus:border-[#0E4B9E] focus:ring-2 focus:ring-[#DCEBFA]"
                    >
                      <option value="never">Never</option>
                      <option value={3}>3 days</option>
                      <option value={7}>7 days</option>
                      <option value={15}>15 days</option>
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                      <option value={180}>180 days</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 border border-[#E2E8F0] rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[17px] font-bold text-[#111827]">
                        Storage Usage
                      </p>

                      <p className="text-[13px] font-semibold text-[#64748B] mt-1">
                        Current document storage consumption.
                      </p>
                    </div>

                    <span className="text-[16px] font-bold text-[#111827]">
                      6.8 GB / 10 GB
                    </span>
                  </div>

                  <div className="mt-5 h-3 rounded-full bg-[#E2E8F0] overflow-hidden">
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