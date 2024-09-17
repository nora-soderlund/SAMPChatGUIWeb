export type ChatData = {
    top: string;
    bottom: string;
  
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

export const defaultChatData: ChatData = {
    top: "* Ray Maverick waves.",
    bottom: "",
  
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
  