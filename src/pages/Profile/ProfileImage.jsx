import React, { useRef, useState } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { uploadProfileImage, removeProfileImage, getFileUrl } from "../../services/profileApi";
import { getInitials, getAvatarColor } from "../../utils/avatar";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const ProfileImage = ({ user, profileImage, onChange }) => {
  const fileInputRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials = getInitials(firstName, lastName);
  const avatarColor = getAvatarColor(user?.email || `${firstName}${lastName}`);

  const currentImageUrl = previewUrl || getFileUrl(profileImage?.fileURL);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP images are allowed.");
      return false;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Image size must be under 2MB.");
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;
    if (!validateFile(file)) return;

    // URL.createObjectURL is used ONLY for the temporary local preview
    // while the upload is in flight — never as the permanent source.
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const response = await uploadProfileImage(file);
      toast.success(response?.message || "Profile photo uploaded successfully");
      onChange?.({
        mediaID: response?.data?.mediaID,
        fileURL: response?.data?.fileURL,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to upload profile photo",
      );
    } finally {
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(null);
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);

    try {
      const response = await removeProfileImage();
      toast.success(response?.message || "Profile photo removed successfully");
      onChange?.(null);
      setConfirmRemove(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to remove profile photo",
      );
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-6">
      <div className="relative w-24 h-24 shrink-0">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={22} />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[#0F265C]">
          {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Profile Photo"}
        </h3>

        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>

        <p className="text-gray-400 text-xs mt-1">JPG, PNG or WEBP (Max 2MB)</p>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#FF7A21] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60 text-sm font-medium"
          >
            <Camera size={16} />
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          {profileImage && (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 text-sm font-medium text-gray-700"
            >
              <Trash2 size={16} />
              Remove
            </button>
          )}
        </div>
      </div>

      {confirmRemove && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h4 className="text-lg font-semibold text-[#0F265C]">
              Remove Profile Photo?
            </h4>

            <p className="text-sm text-gray-500 mt-2">
              This will remove your current profile photo.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                disabled={removing}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={removing}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm disabled:opacity-60"
              >
                {removing ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImage;