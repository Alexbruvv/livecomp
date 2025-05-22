import { DateRangePicker, Input, Select, SpaceBetween } from "@cloudscape-design/components";
import { insertCompetitionSchema } from "@livecomp/server/src/db/schema/competitions";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import ControlledFormField from "../form/ControlledFormField";
import { api } from "../../../utils/trpc";
import { useMemo } from "react";

export const competitionFormSchema = insertCompetitionSchema;
type FormData = z.infer<typeof competitionFormSchema>;

export default function CompetitionFormFields({ form }: { form: UseFormReturn<FormData> }) {
    const { data: games, isPending: gamesPending } = api.games.fetchAll.useQuery();
    const { data: venues, isPending: venuesPending } = api.venues.fetchAll.useQuery();

    const gameOptions = useMemo(() => games?.map((game) => ({ label: game.name, value: game.id })) ?? [], [games]);
    const venueOptions = useMemo(
        () => venues?.map((venue) => ({ label: venue.name, value: venue.id })) ?? [],
        [venues]
    );

    return (
        <SpaceBetween direction="vertical" size="s">
            <ControlledFormField
                form={form}
                name="name"
                label="Name"
                render={({ field }) => <Input placeholder="Name" {...field} />}
            />

            <ControlledFormField
                form={form}
                name="shortName"
                label="Short name"
                render={({ field }) => <Input placeholder="Short name" {...field} />}
            />

            <ControlledFormField
                form={form}
                name="gameId"
                label="Game"
                render={({ field }) => (
                    <Select
                        {...field}
                        options={gameOptions}
                        selectedOption={gameOptions.find((option) => option.value === field.value) ?? null}
                        onChange={(e) => {
                            form.setValue("gameId", e.detail.selectedOption.value ?? "");
                        }}
                        loadingText="Loading games"
                        statusType={gamesPending ? "loading" : undefined}
                    />
                )}
            />

            <ControlledFormField
                form={form}
                name="venueId"
                label="Venue"
                render={({ field }) => (
                    <Select
                        {...field}
                        options={venueOptions}
                        selectedOption={venueOptions.find((option) => option.value === field.value) ?? null}
                        onChange={(e) => {
                            form.setValue("venueId", e.detail.selectedOption.value ?? "");
                        }}
                        loadingText="Loading venues"
                        statusType={venuesPending ? "loading" : undefined}
                    />
                )}
            />

            <ControlledFormField
                label="Match hold offset"
                form={form}
                name="matchHoldOffset"
                render={({ field }) => (
                    <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="Match hold offset"
                        {...field}
                        value={field.value?.toString() ?? "0"}
                        onChange={(e) => {
                            form.setValue(field.name, parseInt(e.detail.value));
                        }}
                    />
                )}
            />

            <ControlledFormField
                form={form}
                name="startsAt"
                render={({ field: startField }) => (
                    <ControlledFormField
                        form={form}
                        name="endsAt"
                        label="Dates"
                        render={({ field: endField }) => (
                            <DateRangePicker
                                value={{
                                    type: "absolute",
                                    startDate: startField.value.toISOString(),
                                    endDate: endField.value.toISOString(),
                                }}
                                onChange={({ detail: { value } }) => {
                                    if (value?.type === "absolute") {
                                        form.setValue("startsAt", new Date(value.startDate));
                                        form.setValue("endsAt", new Date(value.endDate));
                                    }
                                }}
                                absoluteFormat="long-localized"
                                relativeOptions={[]}
                                rangeSelectorMode="absolute-only"
                                isValidRange={(range) => {
                                    if (range?.type !== "absolute") {
                                        return {
                                            valid: false,
                                            errorMessage: "Only absolute date ranges are permitted.",
                                        };
                                    }

                                    return { valid: true };
                                }}
                            />
                        )}
                    />
                )}
            />
        </SpaceBetween>
    );
}

