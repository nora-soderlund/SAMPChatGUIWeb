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
};

export type ChatSectionData = {
    text: string;

    useBackground: boolean;
    background: string;
    outside: boolean;
};

export const defaultChatData: ChatData = {
    top: {
        text: "* Ray Maverick waves.",
        background: "black",
        useBackground: false,
        outside: false
    },

    bottom: {
        text: "",
        background: "black",
        useBackground: false,
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
    includeBroadcasts: false
  };
  