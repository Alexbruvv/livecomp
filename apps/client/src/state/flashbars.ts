import { atom } from "jotai";
import { v4 } from "uuid";
import { store } from "./store";
import { FlashbarProps } from "@cloudscape-design/components";

export const flashbarItemsAtom = atom([] as FlashbarProps["items"]);

export function showFlashbar(config: FlashbarProps["items"][number], duration: number = 5000) {
    const id = v4();

    store.set(flashbarItemsAtom, (prev) => [
        {
            ...config,
            id,
            dismissible: true,
            onDismiss: () => store.set(flashbarItemsAtom, (prev) => prev.filter((flashbar) => flashbar.id !== id)),
        },
        ...prev,
    ]);

    setTimeout(() => {
        store.set(flashbarItemsAtom, (prev) => prev.filter((flashbar) => flashbar.id !== id));
    }, duration);
}

