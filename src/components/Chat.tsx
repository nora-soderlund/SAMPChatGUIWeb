import { Fragment } from "react/jsx-runtime";
import { ChatSectionData } from "../interfaces/ChatData";

export type ChatProps = {
    id: string;
    title: string;
    chatSection: ChatSectionData;
    onChange: (chatSection: ChatSectionData) => void;
};

export default function Chat({ id, title, chatSection, onChange }: ChatProps) {
    return (
        <Fragment>
            <div className="modal">
            <div className="header">
                <p>{title}</p>
            </div>
            
            <div className="content">
                <textarea value={chatSection.text} onChange={(event) =>
                    onChange({
                    ...chatSection,
                    text: event.target.value
                    })}
                    style={{
                    width: "100%",
                    height: 160,
                    background: "none",
                    resize: "none",
                    margin: 0,
                    color: "#FFF"
                    }}/>

            <p style={{ padding: "0 10px", margin: "5px 0" }}><small>If you want the chat to be put on a background, enter the color here.</small></p>
            
            <div style={{
                display: "flex",
                flexDirection: "row"
            }}>
                <fieldset>
                    <input id={`${id}-useBackground`} type="checkbox" checked={chatSection.useBackground} onChange={() => onChange({
                    ...chatSection,
                    useBackground: !chatSection.useBackground
                    })}/>

                    <label htmlFor={`${id}-useBackground`}>Use background</label>
                </fieldset>

                <input disabled={!chatSection.useBackground} type="text" placeholder="transparent" value={chatSection.background} style={{ flex: 1 }} onChange={(event) => onChange({
                    ...chatSection,
                    background: event.target.value
                })}/>
                
                <fieldset>
                    <input id={`${id}-useMask`} disabled={!chatSection.useBackground} type="checkbox" checked={chatSection.useMask} onChange={() => onChange({
                    ...chatSection,
                    useMask: !chatSection.useMask
                    })}/>

                    <label htmlFor={`${id}-useMask`}>Use mask for background</label>
                </fieldset>

                <input disabled={!chatSection.useBackground || !chatSection.useMask} type="number" placeholder="5" value={chatSection.maskWidth} style={{ flex: 1 }} onChange={(event) => onChange({
                    ...chatSection,
                    maskWidth: parseInt(event.target.value)
                })}/>
            </div>
                
              <fieldset>
                <input id={`${id}-outside`} type="checkbox" checked={chatSection.outside} onChange={() => onChange({
                  ...chatSection,
                  outside: !chatSection.outside
                })}/>

                <label htmlFor={`${id}-outside`}>Put text outside of the image</label>
              </fieldset>
            </div>
          </div>
        </Fragment>
    );
}
