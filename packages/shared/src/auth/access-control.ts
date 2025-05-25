import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements,
    system: ["login"],
    competition: ["create", "update", "configure", "control", "score", "delete"],
    game: ["create", "update", "configure", "delete"],
    venue: ["create", "update", "configure", "delete"],
} as const;

export const accessControl = createAccessControl(statement);

const viewer = accessControl.newRole({
    system: ["login"],
});

const marshal = accessControl.newRole({
    ...viewer.statements,
    competition: ["control"],
});

const admin = accessControl.newRole({
    ...marshal.statements,
    competition: ["create", "update", "configure", "control", "score", "delete"],
    game: ["create", "update", "delete"],
    venue: ["create", "update", "configure", "delete"],
});

const superAdmin = accessControl.newRole({
    ...admin.statements,
    ...adminAc.statements,
});

export const roles = {
    viewer,
    marshal,
    admin,
    superAdmin,
};

