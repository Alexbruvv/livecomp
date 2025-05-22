import { CronJob } from "cron";
import { displaysRepository } from "../modules/displays/displays.repository";
import { DateTime } from "luxon";
import { and, eq, gt, lte } from "drizzle-orm";
import { displays } from "../db/schema/displays";

export const displaysJob = new CronJob("* * * * * *", async () => {
    const targetDate = DateTime.now().minus({ seconds: 10 }).toJSDate();

    await displaysRepository.update(
        { online: true },
        { where: and(gt(displays.lastHeartbeat, targetDate), eq(displays.online, false)) }
    );
    await displaysRepository.update(
        { online: false },
        { where: and(lte(displays.lastHeartbeat, targetDate), eq(displays.online, true)) }
    );
});

