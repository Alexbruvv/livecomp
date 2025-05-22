import { StatusIndicator } from "@cloudscape-design/components";
import { MatchStatus } from "@livecomp/utils/src/types";

export default function MatchStatusIndicator({ status }: { status: MatchStatus | undefined }) {
    if (!status) return <>...</>;

    if (status === "notStarted")
        return (
            <StatusIndicator type="pending" colorOverride="grey">
                Not started
            </StatusIndicator>
        );
    if (status === "staging")
        return (
            <StatusIndicator type="pending" colorOverride="blue">
                Staging
            </StatusIndicator>
        );
    if (status === "inProgress")
        return (
            <StatusIndicator type="in-progress" colorOverride="yellow">
                In progress
            </StatusIndicator>
        );
    if (status === "finished")
        return (
            <StatusIndicator type="success" colorOverride="green">
                Finished
            </StatusIndicator>
        );
}

