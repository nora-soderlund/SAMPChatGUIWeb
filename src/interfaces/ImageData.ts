export type ImageDataOption = {
    enabled: boolean;
    value: number;
    maxValue: number;
  };
  
  export type ImageData = {
    width: number;
    height: number;
  
    options: {
      brightness: ImageDataOption;
      grayscale: ImageDataOption;
      sepia: ImageDataOption;
      saturate: ImageDataOption;
      contrast: ImageDataOption;
    };
  };
  
 export const defaultImageData: ImageData = {
    width: 800,
    height: 600,
  
    options: {
      brightness: {
        enabled: false,
        value: 1,
        maxValue: 2
      },
      
      grayscale: {
        enabled: false,
        value: 1,
        maxValue: 2
      },
  
      sepia: {
        enabled: false,
        value: 1,
        maxValue: 1
      },
  
      saturate: {
        enabled: false,
        value: 2,
        maxValue: 4
      },
  
      contrast: {
        enabled: false,
        value: 1.5,
        maxValue: 3
      }
    }
  };
