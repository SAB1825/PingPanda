import { useQueryClient } from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
export const CreateEventCategoryModal = ({children} : PropsWithChildren) => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    // const {} = useForm({
    //     resolver: zodResolver()
    // })
}