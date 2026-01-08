import {UserProfile} from "@clerk/nextjs";

export default function Account () {
  return (
    <main className="flex flex-col items-center justify-center w-full">
      <UserProfile />
    </main>
  )
}
