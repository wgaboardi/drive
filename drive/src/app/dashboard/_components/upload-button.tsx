"use client";

import { Button } from '@/components/ui/button';
import { useOrganization, useUser } from '@clerk/nextjs';
import { useMutation  } from 'convex/react';
import { api } from "../../../../convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react';
import { Doc } from '../../../../convex/_generated/dataModel';

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z.custom<FileList>((val) => val instanceof FileList, "required").refine((files) => files.length >0, 'Required')
})


export function UploadButton() {
  const organization = useOrganization();
  const user = useUser();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  })

  const fileRef=form.register("file");
  const { toast } = useToast()
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    if (!orgId) return;

    const postUrl = await generateUploadUrl();
    const fileType = values.file[0]!.type;
    const result = await fetch(postUrl, {
      method: "POST",
      headers: {"Content-type": fileType},
      body: values.file[0],
    })
    const { storageId } = await result.json();
    const types = {
      "image/png" : "image",
      "application/pdf" : "pdf",
      "text/csv" : "csv",
      "text/plain" : "txt",
    } as Record<string, Doc<"files">["type"]>;

    try {
      await createFile({
        name:values.title, 
        fileId: storageId, 
        orgId,
        type: types[fileType],
      });
      form.reset();
      setIsFileDialogOpen(false);
      toast({
        variant: "success",
        title: "File uploaded",
        description: "Now everyone can view your file!",
      })
  } catch (err) {
      form.reset();
      setIsFileDialogOpen(false);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your file could not be upload. Try again!",
      })
  }


  }
  
  let orgId: string | undefined;
  
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  
  const createFile = useMutation(api.files.createFile);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  return (
      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogTrigger asChild>
        <Button onClick={() => {      }}>Upload File</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-8">Upload your File here</DialogTitle>
            <DialogDescription>
            <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="asdf" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={() => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <Input type="file" {...fileRef} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="flex gap-2">
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit</Button>
      </form>
    </Form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
  )
}
