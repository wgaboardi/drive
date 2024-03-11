"use client";

import { Button } from '@/components/ui/button';
import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton, useOrganization, useSession, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from "../../convex/_generated/api";
import Image from "next/image";


export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const createFile = useMutation(api.files.createFile);
  const files = useQuery(api.files.getFiles, orgId ? { orgId }: 'skip');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignedOut>
        <SignInButton mode="modal">
        <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <SignOutButton>
        <Button>Sign Out</Button>
        </SignOutButton>      </SignedIn>
      {files?.map(file => {
        return <div key={file._id}>{file.name}</div>
      })}

      <Button onClick={() => {
        createFile({name:'Hello Brazil', orgId})
      }}>Click me</Button>
      
      
    </main>
  );
}
