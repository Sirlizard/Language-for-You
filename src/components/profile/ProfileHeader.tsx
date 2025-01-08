import { User } from "lucide-react";

export const ProfileHeader = () => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="bg-gray-100 p-4 rounded-full">
        <User className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-2xl font-cambria font-bold">Profile</h1>
        <p className="text-gray-500">Manage your profile settings</p>
      </div>
    </div>
  );
};