import React, { useRef } from "react";
import { List } from "semantic-ui-react";

interface SectionBody {
    ref: React.MutableRefObject<HTMLDivElement | undefined>;
}

// Takes in title and body and wraps them with required refs
// so clicking on the title will scroll to the body
export function useSection(
    title: string,
    body: (props: SectionBody) => JSX.Element
) {
    const ref = useRef<HTMLDivElement>();

    const Header = () => {
        return (
            <List.Item
                as="a"
                onClick={() => ref.current && ref.current.scrollIntoView(true)}
            >
                {title}
            </List.Item>
        );
    };

    const WrappedBody = () => {
        return body({ ref });
    };

    return [Header, WrappedBody];
}

export function CenteredImage({ src, alt }: { src: string; alt: string }) {
    return (
        <img
            src={src}
            alt={alt}
            style={{
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "1rem",
                marginBottom: "1rem",
                width: "50%",
            }}
        />
    );
}
