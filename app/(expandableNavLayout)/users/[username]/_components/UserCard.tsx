import Link from "next/link";
import ProfilePic from "./ProfilePic";

type Props = {
  user: {
    _id: string;
    username: string;
    name: string;
  };
};

const UserCard = ({ user }: Props) => {
  return (
    <div className="group flex flex-row items-center rounded-2xl border border-black/10 bg-white p-3 transition-all hover:shadow-md sm:flex-col sm:p-6 dark:border-white/10 dark:bg-black">
      <Link
        href={`/@${user.username}`}
        className="relative mb-0 h-10 w-10 overflow-hidden rounded-full sm:mb-4 sm:h-24 sm:w-24"
      >
        <ProfilePic userId={user._id} userName={user.username} className="text-xs! sm:text-lg!" />
      </Link>

      <div className="mb-0 ml-3 text-left sm:mb-4 sm:ml-0 sm:text-center">
        <Link href={`/@${user.username}`} className="block text-sm font-bold sm:text-lg">
          {user.name}
        </Link>
        <p className="text-xs text-gray-500 sm:text-sm">@{user.username}</p>
      </div>

      <Link
        href={`/@${user.username}`}
        className="mt-auto mb-auto ml-auto rounded-full bg-black/20 px-4 py-2 text-center text-xs font-bold transition-colors hover:bg-black/25 sm:mb-0 sm:ml-0 sm:w-full sm:text-sm"
      >
        View Profile
      </Link>
    </div>
  );
};

export default UserCard;
