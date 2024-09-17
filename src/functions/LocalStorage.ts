import { ChatData, defaultChatData } from "../interfaces/ChatData";
import { ImageData } from "../interfaces/ImageData";

export type LocalStorageData = {
    version?: 1 | 2 | 3;
    chatData: ChatData;
    imageData: ImageData;
};

export const currentLocalStorageVersion = 3; 

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
    
    if(localStorageData.version === 1) {
        localStorageData.version = 2;
        
        localStorageData.chatData.top = {
            text: localStorageData.chatData.top as unknown as string
        } as any;
        
        localStorageData.chatData.bottom = {
            text: localStorageData.chatData.bottom as unknown as string
        } as any;

        saveLocalStorageData(localStorageData);
    }
    
    if(localStorageData.version === 2) {
        localStorageData.version = 3;
        
        localStorageData.chatData.top = {
            text: localStorageData.chatData.top.text,
            background: "black",
            useBackground: false,
            outside: false
        };
        
        localStorageData.chatData.bottom = {
            text: localStorageData.chatData.bottom.text,
            background: "black",
            useBackground: false,
            outside: false
        };

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
  