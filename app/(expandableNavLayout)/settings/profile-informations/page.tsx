"use client";
import { useAppContext } from "@/contexts/AppContext";
import fetcher from "@/libs/fetcher";
import { UserType } from "@/types/userTypes";
import Dropdown from "@/ui/components/Dropdown";
import Input from "@/ui/components/Inputs/Input";
import TextAreaInput from "@/ui/components/Inputs/TextAreaInput";
import React, { useState, useEffect } from "react";
import { BiTrash, BiPlus } from "react-icons/bi";
import { toast } from "react-toastify";
import ProfilePicUpload from "./_components/ProfilePicUpload";

const ProfileForm = () => {
  const [userData, setUserData] = useState<Partial<UserType>>({
    name: "",
    email: "",
    about: "",
    username: "",
    links: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAppContext();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await fetcher.get<{ success: boolean; data: UserType }>(
          "/users/" + user?.username
        );
        if (res.body?.success) {
          setUserData(res.body.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!userData.name) {
      toast.error("Name is required");
      return;
    }

    // Note: You can now use `selectedFile` here to perform the actual upload
    if (selectedFile) {
      console.log("File ready for upload:", selectedFile);
    }

    setIsSubmitting(true);
    try {
      const { body, error } = await fetcher.put<UserType, UserType>("/me", userData as UserType);
      if (error) throw new Error(error);
      if (body) {
        toast.success("Profile updated successfully");
        setImageTimestamp(Date.now());
      }
    } catch (err: any) {
      toast.error(err.message || "Error updating profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLink = () => {
    const currentLinks = userData.links || [];
    setUserData({
      ...userData,
      links: [...currentLinks, { type: "Other", url: "" }],
    });
  };

  const handleUpdateLink = (index: number, field: "type" | "url", value: string) => {
    const currentLinks = [...(userData.links || [])];
    currentLinks[index] = { ...currentLinks[index], [field]: value as any };
    setUserData({ ...userData, links: currentLinks });
  };

  const handleRemoveLink = (index: number) => {
    if (index < 0) return;
    const currentLinks = (userData.links || []).filter((_, i) => i !== index);
    setUserData({ ...userData, links: currentLinks });
  };

  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto bg-white">
      <div className="m-6 mx-8 flex justify-between gap-8">
        <div className="flex-1">
          <div className="mb-6">
            <div className="text-lg font-bold">Profile Information</div>
            <div className="text-sm text-black/60">
              Update your account details and public profile.
            </div>
          </div>

          <Input
            label="Full Name (required)"
            description="This is your public display name."
            value={userData.name || ""}
            onChange={(val) => setUserData({ ...userData, name: val })}
            placeholder="Enter your name"
            containerClass="mb-4"
            labelClass="text-sm font-semibold"
            inputClass="text-sm"
          />

          <Input
            label="Email Address"
            description="Your email address is used for sign in and notifications."
            value={userData.email || ""}
            onChange={() => {}}
            disabled
            placeholder="email@example.com"
            containerClass="mb-4 opacity-70"
            labelClass="text-sm font-semibold"
            inputClass="text-sm cursor-not-allowed"
          />

          <TextAreaInput
            label="Bio"
            description="Brief description for your profile. Max 200 characters."
            value={userData.about || ""}
            onChange={(val) => setUserData({ ...userData, about: val })}
            placeholder="Tell us about yourself"
            max={200}
            containerClass="mb-4"
            inputClass="resize-none text-sm"
            mainInputContainerClass="h-40"
          />

          <div className="mb-6">
            <div className="text-sm font-semibold">Social Links</div>
            <div className="mb-4 text-sm text-black/60">
              Add links to your social media profiles.
            </div>

            {userData.links?.map((link, index) => (
              <div key={index} className="mb-3 flex items-end gap-3">
                <div className="flex-none">
                  <Dropdown
                    width="140px"
                    value={link.type}
                    options={[
                      { label: "YouTube", value: "YouTube" },
                      { label: "Twittch", value: "Twittch" },
                      { label: "Instagram", value: "Instagram" },
                      { label: "TikTok", value: "TikTok" },
                      { label: "X", value: "X" },
                      { label: "Facebook", value: "Facebook" },
                      { label: "Other", value: "Other" },
                    ]}
                    onChange={(opt) => handleUpdateLink(index, "type", opt.value.toString())}
                    containerClassName="text-sm"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={link.url}
                    onChange={(val) => handleUpdateLink(index, "url", val)}
                    placeholder="https://..."
                    inputClass="text-sm"
                  />
                </div>
                <button
                  onClick={() => handleRemoveLink(index)}
                  className="mb-1 cursor-pointer p-2 text-black/40 transition-colors hover:text-red-500"
                >
                  <BiTrash size={20} />
                </button>
              </div>
            ))}

            <button
              onClick={handleAddLink}
              className="mt-2 flex cursor-pointer items-center gap-2 text-sm font-semibold text-black/60 transition-colors hover:text-black"
            >
              <BiPlus size={18} />
              Add Link
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className={`cursor-pointer rounded-full bg-black/80 px-6 py-2 text-sm font-semibold text-white hover:bg-black/70 ${
                isSubmitting ? "opacity-50" : ""
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <ProfilePicUpload
          userId={userData._id}
          userName={userData.name}
          imageTimestamp={imageTimestamp}
          onImageChange={(file) => setSelectedFile(file)}
        />
      </div>
    </div>
  );
};

export default ProfileForm;
