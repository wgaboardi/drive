"use client";

import { Button } from '@/components/ui/button';
import { SignInButton, SignOutButton, SignedIn, SignedOut, useOrganization, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from "../../convex/_generated/api";

import { UploadButton } from './upload-button';
import { FileCard } from './file-card';
import Image from 'next/image';


export default function Home() {
  const organization = useOrganization();
  const user = useUser();
 
  let orgId: string | undefined;
  
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  
  const files = useQuery(api.files.getFiles, orgId ? { orgId }: 'skip');
  
  
  return (
    <main className="container mx-auto pt-12">
      {files && files.length=== 0 && (
        <div className="flex flex-col gap-4 w-full items-center mt-12">
          <Image
          alt="an image of a picture and directory icon" 
          width="300" 
          height="300" 
          src="/empty.svg"
          />
          <div className="text-2xl">You have no files, upload one now</div>
          <UploadButton/>
        </div>
      )}
      {files && files.length>0 && (
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold">Your files</h1>
        <UploadButton/>
      </div>
      )}
      <SignedOut>
        <SignInButton mode="modal">
        <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <SignOutButton>
        <Button>Sign Out</Button>
        </SignOutButton>      
      </SignedIn>
      <div className="grid grid-cols-4 gap-4">
      {files?.map(file => {
        return <FileCard key={file._id} file={file}/>
      })}
      </div>
    </main>
  );
}
