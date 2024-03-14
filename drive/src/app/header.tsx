"use client"
import { Button } from '@/components/ui/button';
import { OrganizationSwitcher, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import Link from 'next/link';


export function Header() {
  return <div className="border-b py-4 bg-gray-50">
    <div className="items-center container mx-auto justify-between flex">
    <Link href="/" className="flex gap-2 items-center text-xl text-black">
          FileDrive
        </Link>

        <SignedIn>
          <Button variant={"outline"}>
            <Link href="/dashboard/files">Your Files</Link>
          </Button>
        </SignedIn>
      <div className="gap-2 flex">
        <OrganizationSwitcher/>
        <UserButton/>
        <SignedOut>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
      </div>
    </div>
  </div>
}