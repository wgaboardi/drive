"use client"
import { OrganizationSwitcher, UserButton } from '@clerk/clerk-react';


export function Header() {
  return <div className="border-b py-4 bg-gray-50">
    <div className="items-center container mx-auto justify-between flex">
      <div>FileDrive</div>
      <div className="gap-2 flex">
        <OrganizationSwitcher/>
        <UserButton/>
      </div>
    </div>
  </div>
}