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
};

export const defaultChatData: ChatData = {
    top: {
        text: "* Ray Maverick waves."
    },
    
    bottom: {
        text: ""
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
  