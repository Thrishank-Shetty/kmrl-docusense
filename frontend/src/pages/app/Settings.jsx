import { useState } from "react";

export default function Settings() {
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

  const inputClass =
    "h-11 w-full rounded-lg border border-[#D7DEE8] bg-white px-3 text-[15px] font-semibold text-[#111827] outline-none focus:border-[#0E4B9E] focus:ring-2 focus:ring-[#DCEBFA] disabled:bg-[#F8FAFC] disabled:text-[#475569]";

  return (
    <div className="min-h-screen bg-[#DCEBFA] px-8 py-5">
      {/* PAGE TITLE */}
      <h1 className="mb-5 text-[32px] font-bold leading-tight text-[#111827]">
        Profile
      </h1>

      <div className="grid grid-cols-[250px_1fr] items-start gap-6">
        {/* LEFT PROFILE MENU */}
        <div className="rounded-xl border border-[#DCE5EF] bg-white p-3 shadow-sm">
          <button
            type="button"
            className="
              w-full
              rounded-lg
              bg-[#0E4B9E]
              px-5
              py-4
              text-left
              text-[15px]
              font-bold
              text-white
              shadow-sm
            "
          >
            Profile
          </button>
        </div>

        {/* PROFILE CONTENT */}
        <div className="rounded-xl border border-[#DCE5EF] bg-white p-8 shadow-sm">
          <div>
            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[25px] font-bold text-[#111827]">
                  User Profile
                </h2>

                <p className="mt-2 text-[14px] font-medium text-[#64748B]">
                  View and manage your account information.
                </p>
              </div>
            </div>

            {/* PROFILE SUMMARY */}
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
                    <span
                      className="
                        inline-flex
                        h-10
                        items-center
                        rounded-lg
                        bg-[#063B82]
                        px-5
                        text-[13px]
                        font-bold
                        text-white
                        hover:bg-[#052E68]
                      "
                    >
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

            {/* ERROR */}
            {profileError && (
              <div className="mt-5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#B91C1C]">
                {profileError}
              </div>
            )}

            {/* PROFILE FIELDS */}
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
                      handleProfileChange(
                        field,
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            {/* EDIT ACTIONS */}
            {editProfile && (
              <div className="mt-9 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="
                    h-11
                    rounded-lg
                    border
                    border-[#CBD5E1]
                    px-6
                    text-[14px]
                    font-bold
                    text-[#475260]
                    hover:bg-[#F8FAFC]
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="
                    h-11
                    rounded-lg
                    bg-[#0E4B9E]
                    px-7
                    text-[14px]
                    font-bold
                    text-white
                    hover:bg-[#063B82]
                  "
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}