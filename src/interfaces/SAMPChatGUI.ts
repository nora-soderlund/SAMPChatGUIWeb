export type SAMPChatGUIOutput = {
    width: number;
    height: number;

    masks: SAMPChatGUIMask[];
};

export type SAMPChatGUIMask = {
    left: number;
    top: number;
    
    width: number;
    height: number;
};
