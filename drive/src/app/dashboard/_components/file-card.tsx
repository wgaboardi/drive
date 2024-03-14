import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Doc, Id } from '../../../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { FileTextIcon, GanttChartIcon, GanttChartSquareIcon, ImageIcon, MoreVertical, StarHalf, StarIcon, TextIcon, TrashIcon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ReactNode, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
import { Protect } from '@clerk/clerk-react'



function FileCardActions({file, isFavorited} : {file: Doc<"files">; isFavorited:boolean}) {
  const deleteFile = useMutation(api.files.deleteFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  return (
  <>
  <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction 
      onClick={async () => { 
        await deleteFile({
          fileId: file._id
        })
        toast({
          variant: "success",
          title: "File deleted!",
          description: "Your file is now gone from the system."
        })
        }}>
        Continue
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

<DropdownMenu>
  <DropdownMenuTrigger>
    <MoreVertical />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => toggleFavorite({fileId: file._id})} className="flex gap-1 items-center cursor-pointed">
      {isFavorited ? (<><div className="flex items-center"><StarIcon className="w-4 h-4"/> Unfavorite</div></>) : 
      (<><div className="flex items-center"><StarHalf className="w-4 h-4"/> Favorite</div></>)}
    </DropdownMenuItem>
    <Protect role="org:admin" fallback={<></>}>
    <DropdownMenuSeparator/>
    <DropdownMenuItem onClick={() => setIsConfirmOpen(true)} className="flex gap-1 text-red-600 items-center cursor-pointed">
      <TrashIcon className="w-4 h-4"/> Delete
    </DropdownMenuItem>
    </Protect>
  </DropdownMenuContent>
</DropdownMenu>
</>
)}

export function FileCard({file, favorites} : {file: Doc<"files">; favorites: Doc<"favorites">[]}) {

  const typeIcons = {
    "png": <ImageIcon />,
    "pdf": <GanttChartSquareIcon />,
    "csv": <GanttChartIcon />,
    "txt": <FileTextIcon />,
  } as unknown as Record<Doc<"files">["type"], ReactNode>;

  function getFileUrl(fileId: Id<"_storage">): string {
    return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
  }

  const  isFavorited = favorites.some((favorite) => favorite.fileId === file._id);
  
  return (
  <Card>
  <CardHeader className="relative">
    <CardTitle className="flex gap-2">
      <div className="flex justify-center">{typeIcons[file.type]}</div>
      {file.name}
    </CardTitle>
    <div className="absolute top-1 right-1">
      <FileCardActions file={file} isFavorited={isFavorited}/>
    </div>
  </CardHeader>
  <CardContent className="h-[200px] flex justify-center items-center">
    {file.type === "image" && <Image
    alt={file.name}
    width="200"
    height="200"
    src={getFileUrl(file.fileId)}
    />}
    {file.type === "pdf" && <GanttChartSquareIcon className="w-20 h-20"/>}
    {file.type === "csv" && <GanttChartIcon className="w-20 h-20"/>}
    {file.type === "txt" && <FileTextIcon className="w-20 h-20"/>}
  </CardContent>
  <CardFooter className="flex justify-center">
    <Button onClick={() =>
    {
      //open a new tab to the file location on convex
      window.open(getFileUrl(file.fileId),"_blank");
    }
    }>Download</Button>
  </CardFooter>
</Card>
)
}
