import { ChatData, defaultChatData } from "../interfaces/ChatData";
import { ImageData } from "../interfaces/ImageData";

export type LocalStorageData = {
    version?: 1;
    chatData: ChatData;
    imageData: ImageData;
};

export const currentLocalStorageVersion = 1; 

export function loadLocalStorageData() {
    const rawData = localStorage.getItem("options");

    if(!rawData) {
      return null;
    }

    const localStorageData: LocalStorageData = JSON.parse(rawData);

    // advance from no version to version 1
    if(localStorageData.version === undefined) {
        localStorageData.version = 1;

        // update the default chat offset
        if(localStorageData.chatData.offset.left === 30 && localStorageData.chatData.offset.top === 10) {
            localStorageData.chatData.offset = {
                ...defaultChatData.offset
            };
        }

        saveLocalStorageData(localStorageData);
    }

    return localStorageData;
}

export function saveLocalStorageData(localStorageData: Omit<LocalStorageData, "version">) {
    localStorage.setItem("options", JSON.stringify({
        ...localStorageData,
        version: currentLocalStorageVersion
    } satisfies LocalStorageData));
}
  