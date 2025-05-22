import { Entry } from "@napi-rs/keyring";
import { KEYCHAIN_SERVICE_NAME } from "../../constants";

export function getKeychainEntry(serverUrl: string) {
    return new Entry(KEYCHAIN_SERVICE_NAME, serverUrl);
}

