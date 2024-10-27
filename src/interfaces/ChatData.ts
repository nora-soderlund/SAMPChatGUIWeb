export type ChatData = {
    top: ChatSectionData;
    bottom: ChatSectionData;
  
    fontSize: number;
  
    offset: {
      left: number;
      top: number;
    };
  
    characterName: string;
    includeRadio: boolean;
    includeAutomatedActions: boolean;
    includeBroadcasts: boolean;
    includeNotices: boolean;
};

export type ChatSectionData = {
    text: string;

    useBackground: boolean;
    useMask: boolean;
    maskWidth: number;
    background: string;
    outside: boolean;
};

export const defaultChatData: ChatData = {
    top: {
        text: "* Ray Maverick waves.",
        background: "black",
        useBackground: false,
        useMask: false,
        maskWidth: 5,
        outside: false
    },

    bottom: {
        text: "",
        background: "black",
        useBackground: false,
        useMask: false,
        maskWidth: 5,
        outside: false
    },
  
    fontSize: 18,
  
    offset: {
      left: 10,
      top: 10
    },
  
    characterName: "",
  
    includeRadio: true,
    includeAutomatedActions: false,
    includeBroadcasts: false,
    includeNotices: true
  };
  