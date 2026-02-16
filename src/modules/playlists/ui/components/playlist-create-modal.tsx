import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
    name: z.string().min(1)
})

export const PlaylistCreateModal = ({ open, onOpenChange }: Props) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ""
        }
    });

    const utils = trpc.useUtils();

    const createPlaylists = trpc.playlist.create.useMutation({
        onSuccess: () => {
            utils.playlist.getMany.invalidate();
            toast.success("Playlist Created",);
            form.reset();
            onOpenChange(false);
        },
        onError: () => {
            toast.error("Something Went Wrong")
        }
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        createPlaylists.mutate(values);
    }

    return (
        <ResponsiveModal
        title="Create a Playlist"
        open={open}
        onOpenChange={onOpenChange}
        >
            <Form {...form}>
                <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
                >
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name of Playlist</FormLabel>
                            <FormControl>
                                <Input
                                {...field}
                                placeholder="My Favorite Videos"
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                    />
                    <div className="flex justify-end">
                        <Button
                        type="submit"
                        disabled={createPlaylists.isPending}
                        >
                            Create
                        </Button>
                    </div>
                </form>
            </Form>
        </ResponsiveModal>
    )
}