import { FormField, InputProps, NonCancelableCustomEvent } from "@cloudscape-design/components";
import { ReactElement } from "react";
import { ControllerRenderProps, FieldValues, UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";

// Some funky typescript stuff to simplify controlled Cloudscape form fields

type Controller<T extends FieldValues> = typeof Controller<T>;
type ControllerProps<T extends FieldValues> = Parameters<Controller<T>>[0];

export default function ControlledFormField<T extends FieldValues, N extends ControllerProps<T>["name"]>({
    form,
    name,
    render,
    label,
    description,
}: {
    form: UseFormReturn<T>;
    name: N;
    render: (args: {
        field: Omit<ControllerRenderProps<T, N>, "onChange"> & {
            onChange: (e: NonCancelableCustomEvent<InputProps.ChangeDetail>) => void;
        };
    }) => ReactElement;
    label?: string;
    description?: string;
}) {
    return (
        <Controller
            control={form.control}
            name={name}
            render={(args) => (
                <FormField
                    label={label}
                    description={description}
                    errorText={form.formState.errors[name]?.message as string | undefined}
                >
                    {render({
                        field: {
                            ...args.field,
                            onChange: (e) => {
                                args.field.onChange(e.detail.value);
                            },
                        },
                    })}
                </FormField>
            )}
        />
    );
}

