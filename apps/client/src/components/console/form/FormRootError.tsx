import { Alert } from "@cloudscape-design/components";
import { FieldValues, UseFormReturn } from "react-hook-form";

export default function FormRootError<T extends FieldValues>({ form }: { form: UseFormReturn<T> }) {
    const error = form.formState.errors.root;

    if (error) {
        return <Alert type="error">{error.message}</Alert>;
    } else {
        return <></>;
    }
}

